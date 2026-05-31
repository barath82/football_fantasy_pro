import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Season } from '../../database/entities/season.entity';
import { Team } from '../../database/entities/team.entity';

export interface FdrFixture {
  opponent: string;
  isHome: boolean;
  difficulty: number;
}

export interface TeamFdr {
  id: number;
  name: string;
  shortName: string;
  fixtures: Record<number, FdrFixture[]>; // gwFplId → fixtures
}

@Injectable()
export class FixturesService {
  constructor(
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getFdr() {
    const seasonId = await this.getCurrentSeasonId();

    const [fixtureRows, teams] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('gw.fpl_id',          'gwNumber')
        .addSelect('t_h.id',           'homeTeamId')
        .addSelect('t_h.short_name',   'homeShort')
        .addSelect('t_a.id',           'awayTeamId')
        .addSelect('t_a.short_name',   'awayShort')
        .addSelect('f.team_h_difficulty', 'homeDifficulty')
        .addSelect('f.team_a_difficulty', 'awayDifficulty')
        .from('fixtures', 'f')
        .innerJoin('gameweeks', 'gw', 'gw.id = f.gameweek_id AND gw.season_id = :seasonId', { seasonId })
        .innerJoin('teams', 't_h', 't_h.id = f.team_h_id')
        .innerJoin('teams', 't_a', 't_a.id = f.team_a_id')
        .where('f.season_id = :seasonId', { seasonId })
        .orderBy('gw.fpl_id', 'ASC')
        .getRawMany(),

      this.teamRepo.find({
        where: { seasonId },
        order: { shortName: 'ASC' },
        select: ['id', 'name', 'shortName'],
      }),
    ]);

    // Build team map: id → TeamFdr
    const fdrMap = new Map<number, TeamFdr>();
    for (const t of teams) {
      fdrMap.set(t.id, { id: t.id, name: t.name, shortName: t.shortName, fixtures: {} });
    }

    const gwSet = new Set<number>();

    for (const f of fixtureRows) {
      const gw = Number(f.gwNumber);
      gwSet.add(gw);

      const home = fdrMap.get(Number(f.homeTeamId));
      const away = fdrMap.get(Number(f.awayTeamId));

      if (home) {
        home.fixtures[gw] ??= [];
        home.fixtures[gw].push({ opponent: f.awayShort, isHome: true,  difficulty: Number(f.homeDifficulty) });
      }
      if (away) {
        away.fixtures[gw] ??= [];
        away.fixtures[gw].push({ opponent: f.homeShort, isHome: false, difficulty: Number(f.awayDifficulty) });
      }
    }

    return {
      gameweeks: [...gwSet].sort((a, b) => a - b),
      teams: [...fdrMap.values()],
    };
  }

  private async getCurrentSeasonId(): Promise<number> {
    const season = await this.seasonRepo.findOneBy({ isCurrent: true });
    if (!season) throw new NotFoundException('No current season found');
    return season.id;
  }
}
