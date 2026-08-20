import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pick } from '../../database/entities/pick.entity';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Season } from '../../database/entities/season.entity';
import { Player } from '../../database/entities/player.entity';
import { SubmitPicksDto } from './dto/submit-picks.dto';

@Injectable()
export class PicksService {
  constructor(
    @InjectRepository(Pick) private readonly pickRepo: Repository<Pick>,
    @InjectRepository(Gameweek) private readonly gwRepo: Repository<Gameweek>,
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
  ) {}

  async submit(userId: string, dto: SubmitPicksDto): Promise<Pick> {
    const gameweek = await this.resolveGameweek(dto.gameweekFplId);
    if (gameweek.deadlineTime && gameweek.deadlineTime.getTime() <= Date.now()) {
      throw new ForbiddenException('The deadline for this gameweek has passed — picks are locked.');
    }
    const gameweekId = gameweek.id;

    let pick = await this.pickRepo.findOneBy({ userId, gameweekId });
    if (!pick) pick = this.pickRepo.create({ userId, gameweekId });

    pick.transferInPlayerId = dto.transferInPlayerId ?? null;
    pick.transferOutPlayerId = dto.transferOutPlayerId ?? null;
    pick.differentialSucceedPlayerId = dto.differentialSucceedPlayerId;
    pick.differentialBlankPlayerId = dto.differentialBlankPlayerId;
    pick.formation = dto.formation;
    pick.captainPlayerId = dto.captainPlayerId;
    pick.chipPick = (dto.chipPick as Pick['chipPick']) ?? null;
    pick.csSucceedTeamId = dto.csSucceedTeamId ?? null;
    pick.csFailTeamId = dto.csFailTeamId ?? null;

    return this.pickRepo.save(pick);
  }

  async findMine(userId: string, gameweekFplId: number): Promise<Pick | null> {
    const gameweek = await this.resolveGameweek(gameweekFplId);
    return this.pickRepo.findOneBy({ userId, gameweekId: gameweek.id });
  }

  /** Every pick the user has ever submitted, most recent gameweek first — for the "My Picks" page. */
  async findAllMine(userId: string) {
    const picks = await this.pickRepo.find({
      where: { userId },
      relations: {
        gameweek: true,
        transferInPlayer: { team: true },
        transferOutPlayer: { team: true },
        differentialSucceedPlayer: { team: true },
        differentialBlankPlayer: { team: true },
        captainPlayer: { team: true },
        csSucceedTeam: true,
        csFailTeam: true,
      },
    });

    const label = (p: Player | null) => (p ? { webName: p.webName, team: p.team?.shortName ?? null } : null);
    const teamLabel = (t: { name: string; shortName: string } | null) =>
      t ? { name: t.name, shortName: t.shortName } : null;

    return picks
      .sort((a, b) => b.gameweek.fplId - a.gameweek.fplId)
      .map((p) => ({
        gameweekFplId: p.gameweek.fplId,
        gameweekName: p.gameweek.name,
        submittedAt: p.submittedAt,
        formation: p.formation,
        transferIn: label(p.transferInPlayer),
        transferOut: label(p.transferOutPlayer),
        differentialSucceed: label(p.differentialSucceedPlayer),
        differentialBlank: label(p.differentialBlankPlayer),
        captain: label(p.captainPlayer),
        chipPick: p.chipPick,
        csSucceedTeam: teamLabel(p.csSucceedTeam),
        csFailTeam: teamLabel(p.csFailTeam),
      }));
  }

  private async resolveGameweek(fplId: number): Promise<Gameweek> {
    const season = await this.seasonRepo.findOneBy({ isCurrent: true });
    if (!season) throw new NotFoundException('No current season found');
    const gw = await this.gwRepo.findOneBy({ fplId, seasonId: season.id });
    if (!gw) throw new NotFoundException(`Gameweek ${fplId} not found`);
    return gw;
  }
}
