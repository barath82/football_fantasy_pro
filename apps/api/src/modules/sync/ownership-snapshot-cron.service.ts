import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Player } from '../../database/entities/player.entity';
import { Season } from '../../database/entities/season.entity';
import { OwnershipSnapshot } from '../../database/entities/ownership-snapshot.entity';
import { FplApiService } from './fpl-api.service';

const CAPTURE_WINDOW_BEFORE_MS = 2 * 60 * 60 * 1000; // start looking 2h before deadline
const CAPTURE_WINDOW_AFTER_MS = 60 * 60 * 1000; // stay open 1h past it, to self-heal a missed tick

/**
 * Captures ownership % for every player once per gameweek, close to that
 * gameweek's deadline. FPL's own API only exposes *current* ownership, not
 * historical — so this is the only way Differential Impact can ever have
 * real historical ownership to compare against, per the Phase 1 spec.
 * Ticks every 30 minutes; a no-op unless we're inside the capture window
 * and haven't already captured this gameweek, so it's safe to run this
 * often. This is the first scheduled job in this codebase (ScheduleModule
 * was already imported at the root but unused until now).
 *
 * Any gameweek that finishes before this ships has no historical ownership
 * and never will — Differential Impact only becomes accurate going forward
 * from whichever gameweek this first successfully captures.
 */
@Injectable()
export class OwnershipSnapshotCronService {
  private readonly logger = new Logger(OwnershipSnapshotCronService.name);

  constructor(
    private readonly fplApi: FplApiService,
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
    @InjectRepository(Gameweek) private readonly gwRepo: Repository<Gameweek>,
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
    @InjectRepository(OwnershipSnapshot) private readonly ownershipRepo: Repository<OwnershipSnapshot>,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async captureIfNearDeadline(): Promise<void> {
    try {
      const season = await this.seasonRepo.findOneBy({ isCurrent: true });
      if (!season) return;

      const upcoming = await this.gwRepo.findOne({
        where: { seasonId: season.id, finished: false },
        order: { fplId: 'ASC' },
      });
      if (!upcoming?.deadlineTime) return;

      const now = Date.now();
      const deadline = new Date(upcoming.deadlineTime).getTime();
      const inWindow = deadline - now <= CAPTURE_WINDOW_BEFORE_MS && now - deadline <= CAPTURE_WINDOW_AFTER_MS;
      if (!inWindow) return;

      const already = await this.ownershipRepo.findOne({ where: { gameweekId: upcoming.id } });
      if (already) return; // one capture per gameweek is enough

      await this.captureNow(upcoming.id, season.id);
    } catch (err: any) {
      this.logger.error(`Ownership snapshot capture failed: ${err.message}`);
    }
  }

  private async captureNow(gameweekId: number, seasonId: number): Promise<void> {
    const bootstrap = await this.fplApi.getBootstrapStatic();
    const players = await this.playerRepo.find({ where: { seasonId } });
    const dbIdByFplId = new Map(players.map((p) => [p.fplId, p.id]));

    const rows = bootstrap.elements
      .filter((e) => dbIdByFplId.has(e.id))
      .map((e) => {
        const parsed = parseFloat(e.selected_by_percent);
        return {
          playerId: dbIdByFplId.get(e.id)!,
          gameweekId,
          selectedByPercent: Number.isNaN(parsed) ? null : parsed,
        };
      });

    if (!rows.length) return;

    const chunkSize = 200;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await this.ownershipRepo.upsert(rows.slice(i, i + chunkSize), ['playerId', 'gameweekId']);
    }
    this.logger.log(`Captured ownership snapshot for gameweek ${gameweekId}: ${rows.length} players`);
  }
}
