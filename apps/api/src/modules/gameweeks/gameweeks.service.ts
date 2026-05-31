import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Season } from '../../database/entities/season.entity';

const CHIP_LABELS: Record<string, string> = {
  bboost:   'Bench Boost',
  '3xc':    'Triple Captain',
  freehit:  'Free Hit',
  wildcard: 'Wildcard',
};

@Injectable()
export class GameweeksService {
  constructor(
    @InjectRepository(Gameweek)
    private readonly gwRepo: Repository<Gameweek>,
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ─── All gameweeks (season overview) ─────────────────────────────────────

  async findAll() {
    const seasonId = await this.getCurrentSeasonId();
    const rows = await this.gwRepo.find({
      where: { seasonId },
      order: { fplId: 'ASC' },
      select: [
        'id', 'fplId', 'name', 'deadlineTime', 'averageEntryScore',
        'highestScore', 'finished', 'transfersMade', 'chipPlays',
        'mostSelected', 'mostTransferredIn',
      ],
    });
    return rows.map((gw) => this.mapGw(gw));
  }

  // ─── Single GW detail ────────────────────────────────────────────────────

  async findOne(gwFplId: number) {
    const seasonId = await this.getCurrentSeasonId();

    const gw = await this.gwRepo.findOne({
      where: { fplId: gwFplId, seasonId },
    });
    if (!gw) throw new NotFoundException(`Gameweek ${gwFplId} not found`);

    const [topScorers, topTransferredIn, topTransferredOut] = await Promise.all([
      this.getTopScorers(gw.id),
      this.getTopTransferred(gw.id, 'in'),
      this.getTopTransferred(gw.id, 'out'),
    ]);

    return {
      summary: this.mapGw(gw),
      topScorers,
      topTransferredIn,
      topTransferredOut,
    };
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  private async getTopScorers(gameweekId: number) {
    return this.dataSource
      .createQueryBuilder()
      .select('p.id',                                    'id')
      .addSelect('p.web_name',                           'webName')
      .addSelect('p.code',                               'code')
      .addSelect('t.short_name',                         'teamShortName')
      .addSelect('pos.singular_name_short',              'position')
      .addSelect('SUM(pgs.total_points)',                 'totalPoints')
      .addSelect('SUM(pgs.goals_scored)',                 'goals')
      .addSelect('SUM(pgs.assists)',                      'assists')
      .addSelect('SUM(pgs.clean_sheets)',                 'cleanSheets')
      .addSelect('SUM(pgs.bonus)',                        'bonus')
      .addSelect('SUM(pgs.minutes)',                      'minutes')
      .addSelect('SUM(pgs.saves)',                        'saves')
      .from('player_gameweek_stats', 'pgs')
      .innerJoin('players', 'p',   'p.id = pgs.player_id')
      .innerJoin('teams', 't',     't.id = p.team_id')
      .innerJoin('positions', 'pos', 'pos.id = p.position_id')
      .where('pgs.gameweek_id = :gameweekId', { gameweekId })
      .groupBy('p.id, p.web_name, p.code, t.short_name, pos.singular_name_short')
      .orderBy('SUM(pgs.total_points)', 'DESC')
      .limit(15)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          id: r.id,
          webName: r.webName,
          code: r.code,
          team: r.teamShortName,
          position: r.position,
          totalPoints: Number(r.totalPoints ?? 0),
          goals: Number(r.goals ?? 0),
          assists: Number(r.assists ?? 0),
          cleanSheets: Number(r.cleanSheets ?? 0),
          bonus: Number(r.bonus ?? 0),
          minutes: Number(r.minutes ?? 0),
          saves: Number(r.saves ?? 0),
        })),
      );
  }

  private async getTopTransferred(gameweekId: number, direction: 'in' | 'out') {
    const col = direction === 'in' ? 'os.transfers_in' : 'os.transfers_out';
    const alias = direction === 'in' ? 'transfersIn' : 'transfersOut';

    return this.dataSource
      .createQueryBuilder()
      .select('p.id',                 'id')
      .addSelect('p.web_name',        'webName')
      .addSelect('p.code',            'code')
      .addSelect('t.short_name',      'teamShortName')
      .addSelect('pos.singular_name_short', 'position')
      .addSelect(col,                 alias)
      .from('ownership_snapshots', 'os')
      .innerJoin('players', 'p',     'p.id = os.player_id')
      .innerJoin('teams', 't',       't.id = p.team_id')
      .innerJoin('positions', 'pos', 'pos.id = p.position_id')
      .where('os.gameweek_id = :gameweekId', { gameweekId })
      .andWhere(`${col} IS NOT NULL AND ${col} > 0`)
      .orderBy(col, 'DESC')
      .limit(10)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          id: r.id,
          webName: r.webName,
          code: r.code,
          team: r.teamShortName,
          position: r.position,
          value: Number(r[alias] ?? 0),
        })),
      );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private mapGw(gw: Gameweek) {
    const chips = (gw.chipPlays as any[] | null) ?? [];
    return {
      id: gw.id,
      fplId: gw.fplId,
      name: gw.name,
      deadlineTime: gw.deadlineTime,
      averageEntryScore: gw.averageEntryScore,
      highestScore: gw.highestScore,
      transfersMade: gw.transfersMade,
      finished: gw.finished,
      chipPlays: chips.map((c) => ({
        name: CHIP_LABELS[c.chip_name] ?? c.chip_name,
        count: c.num_played,
      })),
    };
  }

  private async getCurrentSeasonId(): Promise<number> {
    const season = await this.seasonRepo.findOneBy({ isCurrent: true });
    if (!season) throw new NotFoundException('No current season found');
    return season.id;
  }
}
