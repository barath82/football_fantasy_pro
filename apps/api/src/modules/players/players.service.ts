import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from '../../database/entities/player.entity';
import { Season } from '../../database/entities/season.entity';
import { PlayerQueryDto } from './dto/player-query.dto';

// Whitelist prevents SQL injection on sort column
// Entity property paths — TypeORM maps these to column names via metadata
const SEASON_SORT: Record<string, string> = {
  totalPoints:       'p.totalPoints',
  pointsPerGame:     'p.pointsPerGame',
  form:              'p.form',
  nowCost:           'p.nowCost',
  selectedByPercent: 'p.selectedByPercent',
  minutes:           'p.minutes',
  goalsScored:       'p.goalsScored',
  assists:           'p.assists',
  cleanSheets:       'p.cleanSheets',
  goalsConceded:     'p.goalsConceded',
  yellowCards:       'p.yellowCards',
  redCards:          'p.redCards',
  saves:             'p.saves',
  bonus:             'p.bonus',
  bps:               'p.bps',
  ictIndex:          'p.ictIndex',
  influence:         'p.influence',
  creativity:        'p.creativity',
  threat:            'p.threat',
  transfersIn:       'p.transfersIn',
  transfersOut:      'p.transfersOut',
  webName:           'p.webName',
};

const GW_SORT: Record<string, string> = {
  totalPoints:      'gw_total_points',
  minutes:          'gw_minutes',
  goalsScored:      'gw_goals_scored',
  assists:          'gw_assists',
  cleanSheets:      'gw_clean_sheets',
  goalsConceded:    'gw_goals_conceded',
  yellowCards:      'gw_yellow_cards',
  redCards:         'gw_red_cards',
  saves:            'gw_saves',
  bonus:            'gw_bonus',
  bps:              'gw_bps',
  nowCost:          'gw_price',
  selectedByPercent:'gw_ownership',
  webName:          'p.web_name',
};

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);

  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ─── Public API ───────────────────────────────────────────────────────────

  async findAll(query: PlayerQueryDto) {
    const seasonId = await this.getCurrentSeasonId();
    return query.gameweek
      ? this.findAllForGameweek(seasonId, query)
      : this.findAllSeason(seasonId, query);
  }

  async findOne(id: number, gameweek?: number) {
    const seasonId = await this.getCurrentSeasonId();

    const player = await this.playerRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.team', 't')
      .innerJoinAndSelect('p.position', 'pos')
      .where('p.id = :id AND p.season_id = :seasonId', { id, seasonId })
      .getOne();

    if (!player) throw new NotFoundException(`Player ${id} not found`);

    const history = await this.getPlayerHistory(id, seasonId);
    return { player: this.mapPlayer(player), history };
  }

  // ─── Season mode ──────────────────────────────────────────────────────────

  private async findAllSeason(seasonId: number, query: PlayerQueryDto) {
    const {
      teamId, positionId, minOwnership, maxOwnership,
      minPrice, maxPrice, minPoints, search, status,
      sortBy = 'totalPoints', sortOrder = 'DESC',
      page = 1, pageSize = 25,
    } = query;

    const sortCol = SEASON_SORT[sortBy] ?? SEASON_SORT.totalPoints;

    const qb = this.playerRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.team', 't')
      .innerJoinAndSelect('p.position', 'pos')
      .where('p.season_id = :seasonId', { seasonId });

    if (teamId)        qb.andWhere('p.team_id = :teamId',                             { teamId });
    if (positionId)    qb.andWhere('p.position_id = :positionId',                     { positionId });
    if (status)        qb.andWhere('p.status = :status',                               { status });
    if (minPrice != null)     qb.andWhere('p.now_cost >= :minPrice',                  { minPrice });
    if (maxPrice != null)     qb.andWhere('p.now_cost <= :maxPrice',                  { maxPrice });
    if (minOwnership != null) qb.andWhere('p.selected_by_percent >= :minOwnership',   { minOwnership });
    if (maxOwnership != null) qb.andWhere('p.selected_by_percent <= :maxOwnership',   { maxOwnership });
    if (minPoints != null)    qb.andWhere('p.total_points >= :minPoints',             { minPoints });
    if (search) {
      qb.andWhere(
        '(p.web_name ILIKE :s OR p.first_name ILIKE :s OR p.second_name ILIKE :s)',
        { s: `%${search}%` },
      );
      // A name that *starts with* the query ranks above one that merely
      // contains it elsewhere — e.g. searching "sa" should put Saka/Salah
      // ahead of Isak, regardless of points. The chosen sort (points, by
      // default) only breaks ties within each relevance group. Ranked on
      // web_name only (what's actually shown) — first/second_name are
      // full legal names not displayed anywhere, so a player whose hidden
      // middle name happens to start with the query (e.g. Matheus "Santos"
      // Cunha, for "sa") would otherwise rank first for no visible reason.
      qb.addSelect(
        `CASE WHEN p.web_name ILIKE :prefix THEN 0 ELSE 1 END`,
        'match_rank',
      )
        .setParameter('prefix', `${search}%`)
        .orderBy('match_rank', 'ASC')
        .addOrderBy(sortCol, sortOrder);
    } else {
      qb.orderBy(sortCol, sortOrder);
    }

    const [players, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data: players.map((p) => this.mapPlayer(p)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ─── Gameweek mode ────────────────────────────────────────────────────────

  private async findAllForGameweek(seasonId: number, query: PlayerQueryDto) {
    const {
      gameweek, teamId, positionId, minOwnership, maxOwnership,
      minPrice, maxPrice, minPoints, search, status,
      sortBy = 'totalPoints', sortOrder = 'DESC',
      page = 1, pageSize = 25,
    } = query;

    const sortCol = GW_SORT[sortBy!] ?? GW_SORT.totalPoints;
    const order   = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Base builder — shared between data + count queries
    const base = this.dataSource
      .createQueryBuilder()
      .from('players', 'p')
      .innerJoin('teams', 't', 't.id = p.team_id')
      .innerJoin('positions', 'pos', 'pos.id = p.position_id')
      .innerJoin('gameweeks', 'gw',
        'gw.fpl_id = :gameweek AND gw.season_id = :seasonId',
        { gameweek, seasonId },
      )
      .leftJoin('player_gameweek_stats', 'pgs',
        'pgs.player_id = p.id AND pgs.gameweek_id = gw.id',
      )
      .leftJoin('ownership_snapshots', 'os',
        'os.player_id = p.id AND os.gameweek_id = gw.id',
      )
      .leftJoin('price_history', 'ph',
        'ph.player_id = p.id AND ph.gameweek_id = gw.id',
      )
      .where('p.season_id = :seasonId', { seasonId })
      .groupBy([
        'p.id', 'p.fpl_id', 'p.web_name', 'p.first_name', 'p.second_name',
        'p.status', 'p.news', 'p.code', 'p.now_cost', 'p.selected_by_percent',
        't.id', 't.name', 't.short_name',
        'pos.id', 'pos.singular_name_short',
        'ph.price', 'os.selected_by_percent',
      ].join(', '));

    if (teamId)     base.andWhere('p.team_id = :teamId',       { teamId });
    if (positionId) base.andWhere('p.position_id = :positionId', { positionId });
    if (status)     base.andWhere('p.status = :status',        { status });
    if (minPrice != null)
      base.andWhere('COALESCE(ph.price, p.now_cost) >= :minPrice', { minPrice });
    if (maxPrice != null)
      base.andWhere('COALESCE(ph.price, p.now_cost) <= :maxPrice', { maxPrice });
    if (minOwnership != null)
      base.andWhere('COALESCE(os.selected_by_percent, p.selected_by_percent) >= :minOwnership',
        { minOwnership });
    if (maxOwnership != null)
      base.andWhere('COALESCE(os.selected_by_percent, p.selected_by_percent) <= :maxOwnership',
        { maxOwnership });
    if (minPoints != null)
      base.having('SUM(COALESCE(pgs.total_points, 0)) >= :minPoints', { minPoints });
    if (search) {
      base.andWhere(
        '(p.web_name ILIKE :s OR p.first_name ILIKE :s OR p.second_name ILIKE :s)',
        { s: `%${search}%` },
      ).setParameter('prefix', `${search}%`);
    }

    const dataQb = base.clone()
      .select('p.id',                                                 'id')
      .addSelect('p.fpl_id',                                          'fpl_id')
      .addSelect('p.web_name',                                        'web_name')
      .addSelect('p.first_name',                                      'first_name')
      .addSelect('p.second_name',                                     'second_name')
      .addSelect('p.status',                                          'status')
      .addSelect('p.news',                                            'news')
      .addSelect('p.code',                                            'code')
      .addSelect('t.id',                                              'team_id')
      .addSelect('t.name',                                            'team_name')
      .addSelect('t.short_name',                                      'team_short_name')
      .addSelect('pos.id',                                            'position_id')
      .addSelect('pos.singular_name_short',                           'position_short')
      .addSelect('COALESCE(SUM(pgs.total_points), 0)',                'gw_total_points')
      .addSelect('COALESCE(SUM(pgs.minutes), 0)',                     'gw_minutes')
      .addSelect('COALESCE(SUM(pgs.goals_scored), 0)',                'gw_goals_scored')
      .addSelect('COALESCE(SUM(pgs.assists), 0)',                     'gw_assists')
      .addSelect('COALESCE(SUM(pgs.clean_sheets), 0)',                'gw_clean_sheets')
      .addSelect('COALESCE(SUM(pgs.goals_conceded), 0)',              'gw_goals_conceded')
      .addSelect('COALESCE(SUM(pgs.yellow_cards), 0)',                'gw_yellow_cards')
      .addSelect('COALESCE(SUM(pgs.red_cards), 0)',                   'gw_red_cards')
      .addSelect('COALESCE(SUM(pgs.saves), 0)',                       'gw_saves')
      .addSelect('COALESCE(SUM(pgs.bonus), 0)',                       'gw_bonus')
      .addSelect('COALESCE(SUM(pgs.bps), 0)',                         'gw_bps')
      .addSelect('COALESCE(ph.price, p.now_cost)',                    'gw_price')
      .addSelect(
        'COALESCE(os.selected_by_percent, p.selected_by_percent)',   'gw_ownership',
      );

    if (search) {
      // Same relevance-first ranking as the season-mode search — see comment there.
      dataQb
        .addSelect(
          `CASE WHEN p.web_name ILIKE :prefix THEN 0 ELSE 1 END`,
          'match_rank',
        )
        .orderBy('match_rank', 'ASC')
        .addOrderBy(sortCol, order);
    } else {
      dataQb.orderBy(sortCol, order);
    }

    dataQb
      .addOrderBy('p.id', 'ASC')
      .limit(pageSize!)
      .offset((page! - 1) * pageSize!);

    const countQb = base.clone()
      .select('COUNT(DISTINCT p.id)', 'total');

    const [rows, countResult] = await Promise.all([
      dataQb.getRawMany(),
      countQb.getRawOne(),
    ]);

    const total = parseInt(countResult?.total ?? '0', 10);

    return {
      data: rows.map((r: any) => this.mapGwRow(r)),
      total,
      page: page!,
      pageSize: pageSize!,
      totalPages: Math.ceil(total / pageSize!),
    };
  }

  // ─── Player gameweek history ───────────────────────────────────────────────

  private async getPlayerHistory(playerId: number, seasonId: number) {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('gw.fpl_id',          'gameweek')
      .addSelect('gw.name',         'gameweekName')
      .addSelect('t_opp.short_name','opponent')
      .addSelect('pgs.was_home',    'wasHome')
      .addSelect('pgs.total_points','totalPoints')
      .addSelect('pgs.minutes',     'minutes')
      .addSelect('pgs.goals_scored','goalsScored')
      .addSelect('pgs.assists',     'assists')
      .addSelect('pgs.clean_sheets','cleanSheets')
      .addSelect('pgs.goals_conceded','goalsConceded')
      .addSelect('pgs.yellow_cards','yellowCards')
      .addSelect('pgs.red_cards',   'redCards')
      .addSelect('pgs.saves',       'saves')
      .addSelect('pgs.bonus',       'bonus')
      .addSelect('pgs.bps',         'bps')
      .addSelect('pgs.influence',   'influence')
      .addSelect('pgs.creativity',  'creativity')
      .addSelect('pgs.threat',      'threat')
      .addSelect('pgs.ict_index',   'ictIndex')
      .addSelect('pgs.value',       'price')
      .addSelect('pgs.selected',    'selected')
      .addSelect('pgs.transfers_in','transfersIn')
      .addSelect('pgs.transfers_out','transfersOut')
      .from('player_gameweek_stats', 'pgs')
      .innerJoin('gameweeks', 'gw',
        'gw.id = pgs.gameweek_id AND gw.season_id = :seasonId', { seasonId })
      .innerJoin('fixtures', 'f', 'f.id = pgs.fixture_id')
      .innerJoin('teams', 't_opp',
        't_opp.id = CASE WHEN pgs.was_home THEN f.team_a_id ELSE f.team_h_id END')
      .where('pgs.player_id = :playerId', { playerId })
      .orderBy('gw.fpl_id', 'ASC')
      .addOrderBy('pgs.id', 'ASC')
      .getRawMany();

    return rows;
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapPlayer(p: Player) {
    return {
      id: p.id,
      fplId: p.fplId,
      webName: p.webName,
      firstName: p.firstName,
      secondName: p.secondName,
      status: p.status,
      news: p.news,
      code: p.code,
      team: p.team
        ? { id: p.team.id, fplId: p.team.fplId, name: p.team.name, shortName: p.team.shortName }
        : null,
      position: p.position
        ? { id: p.position.id, fplId: p.position.fplId, short: p.position.singularNameShort }
        : null,
      nowCost: p.nowCost,
      costChangeStart: p.costChangeStart,
      selectedByPercent: p.selectedByPercent != null ? Number(p.selectedByPercent) : null,
      totalPoints: p.totalPoints,
      pointsPerGame: p.pointsPerGame != null ? Number(p.pointsPerGame) : null,
      form: p.form != null ? Number(p.form) : null,
      minutes: p.minutes,
      goalsScored: p.goalsScored,
      assists: p.assists,
      cleanSheets: p.cleanSheets,
      goalsConceded: p.goalsConceded,
      yellowCards: p.yellowCards,
      redCards: p.redCards,
      saves: p.saves,
      bonus: p.bonus,
      bps: p.bps,
      influence: p.influence != null ? Number(p.influence) : null,
      creativity: p.creativity != null ? Number(p.creativity) : null,
      threat: p.threat != null ? Number(p.threat) : null,
      ictIndex: p.ictIndex != null ? Number(p.ictIndex) : null,
      transfersIn: p.transfersIn,
      transfersOut: p.transfersOut,
    };
  }

  private mapGwRow(r: any) {
    return {
      id: r.id,
      fplId: r.fpl_id,
      webName: r.web_name,
      firstName: r.first_name,
      secondName: r.second_name,
      status: r.status,
      news: r.news,
      code: r.code,
      team: { id: r.team_id, name: r.team_name, shortName: r.team_short_name },
      position: { id: r.position_id, short: r.position_short },
      nowCost: r.gw_price != null ? Number(r.gw_price) : null,
      selectedByPercent: r.gw_ownership != null ? Number(r.gw_ownership) : null,
      totalPoints: Number(r.gw_total_points ?? 0),
      minutes: Number(r.gw_minutes ?? 0),
      goalsScored: Number(r.gw_goals_scored ?? 0),
      assists: Number(r.gw_assists ?? 0),
      cleanSheets: Number(r.gw_clean_sheets ?? 0),
      goalsConceded: Number(r.gw_goals_conceded ?? 0),
      yellowCards: Number(r.gw_yellow_cards ?? 0),
      redCards: Number(r.gw_red_cards ?? 0),
      saves: Number(r.gw_saves ?? 0),
      bonus: Number(r.gw_bonus ?? 0),
      bps: Number(r.gw_bps ?? 0),
    };
  }

  private async getCurrentSeasonId(): Promise<number> {
    const season = await this.seasonRepo.findOneBy({ isCurrent: true });
    if (!season) throw new NotFoundException('No current season found');
    return season.id;
  }
}
