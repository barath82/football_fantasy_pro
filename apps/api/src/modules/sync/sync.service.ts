import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  FplElement,
  FplElementType,
  FplEvent,
  FplFixture,
  FplTeam,
  FplElementHistory,
} from '@fantasy/types';
import { FplApiService } from './fpl-api.service';
import { Season } from '../../database/entities/season.entity';
import { Team } from '../../database/entities/team.entity';
import { Position } from '../../database/entities/position.entity';
import { Player } from '../../database/entities/player.entity';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Fixture } from '../../database/entities/fixture.entity';
import { PlayerGameweekStat } from '../../database/entities/player-gameweek-stat.entity';
import { OwnershipSnapshot } from '../../database/entities/ownership-snapshot.entity';
import { PriceHistory } from '../../database/entities/price-history.entity';
import { ApiSyncLog } from '../../database/entities/api-sync-log.entity';

// Lookup maps: fpl_id → internal db id
type IdMap = Map<number, number>;

// FPL sends these decimal stats as strings (e.g. "0.0"). `parseFloat(x) ||
// null` looks safe but isn't — a genuine 0 is falsy in JS, so every
// zero-valued stat (0.0% ownership, 0 form, etc.) silently becomes NULL
// instead of 0, which then drops those rows out of any `<= :max` SQL filter.
// Only NaN (a real parse failure) should become null.
function parseDecimal(raw: string | undefined | null): number | null {
  const n = parseFloat(raw ?? '');
  return Number.isNaN(n) ? null : n;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(Position) private readonly positionRepo: Repository<Position>,
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
    @InjectRepository(Gameweek) private readonly gameweekRepo: Repository<Gameweek>,
    @InjectRepository(Fixture) private readonly fixtureRepo: Repository<Fixture>,
    @InjectRepository(PlayerGameweekStat) private readonly pgStatRepo: Repository<PlayerGameweekStat>,
    @InjectRepository(OwnershipSnapshot) private readonly ownershipRepo: Repository<OwnershipSnapshot>,
    @InjectRepository(PriceHistory) private readonly priceHistoryRepo: Repository<PriceHistory>,
    @InjectRepository(ApiSyncLog) private readonly syncLogRepo: Repository<ApiSyncLog>,
    private readonly fplApi: FplApiService,
    private readonly config: ConfigService,
  ) {}

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Bootstrap only — season, positions, teams, gameweeks, players. 1 API call,
   * cheap. This is what most callers actually need (a fresh player list and
   * current gameweek); the full per-player stats history is separate because
   * it's 841 additional API calls and memory-heavy enough to have OOM-killed
   * this sandbox once already (see ERRORS.md, 2026-08-19).
   */
  async runBootstrapSync(): Promise<void> {
    const started = Date.now();
    this.logger.log('=== Bootstrap-only FPL sync starting ===');

    try {
      const bootstrap = await this.fplApi.getBootstrapStatic();
      const season = await this.upsertSeason();
      const positionMap = await this.upsertPositions(bootstrap.element_types);
      const teamMap = await this.upsertTeams(bootstrap.teams, season.id);
      const gameweekMap = await this.upsertGameweeks(bootstrap.events, season.id);
      await this.upsertPlayers(bootstrap.elements, season.id, teamMap, positionMap);
      await this.log('bootstrap-static', 'success', bootstrap.elements.length, Date.now() - started);
      this.logger.log(`Bootstrap: ${bootstrap.elements.length} players, ${bootstrap.teams.length} teams, ${bootstrap.events.length} GWs`);

      // Fixtures are a single cheap API call — same cost class as the rest of
      // bootstrap — so they belong here too, not only in the expensive full
      // sync. Without this, fixtures stays empty for anyone who (correctly)
      // avoids ?scope=full, and anything keyed on gameweek fixtures has
      // nothing to work from.
      const fplFixtures = await this.fplApi.getFixtures();
      await this.upsertFixtures(fplFixtures, season.id, teamMap, gameweekMap);
      await this.log('fixtures', 'success', fplFixtures.length, Date.now() - started);
      this.logger.log(`Fixtures: ${fplFixtures.length} ingested`);

      this.logger.log(`=== Bootstrap sync complete in ${((Date.now() - started) / 1000).toFixed(1)}s ===`);
    } catch (err: any) {
      await this.log('bootstrap-static', 'error', 0, Date.now() - started, err.message);
      throw err;
    }
  }

  async runFullSync(): Promise<void> {
    const started = Date.now();
    this.logger.log('=== Full FPL sync starting ===');

    try {
      // Step 1 — Bootstrap (1 API call)
      const bootstrap = await this.fplApi.getBootstrapStatic();
      const season = await this.upsertSeason();
      const positionMap = await this.upsertPositions(bootstrap.element_types);
      const teamMap = await this.upsertTeams(bootstrap.teams, season.id);
      const gameweekMap = await this.upsertGameweeks(bootstrap.events, season.id);
      const playerMap = await this.upsertPlayers(
        bootstrap.elements,
        season.id,
        teamMap,
        positionMap,
      );
      await this.log('bootstrap-static', 'success', bootstrap.elements.length, Date.now() - started);
      this.logger.log(`Bootstrap: ${bootstrap.elements.length} players, ${bootstrap.teams.length} teams, ${bootstrap.events.length} GWs`);

      // Step 2 — Fixtures (1 API call)
      const fplFixtures = await this.fplApi.getFixtures();
      const fixtureMap = await this.upsertFixtures(fplFixtures, season.id, teamMap, gameweekMap);
      await this.log('fixtures', 'success', fplFixtures.length, Date.now() - started);
      this.logger.log(`Fixtures: ${fplFixtures.length} ingested`);

      // Step 3 — Per-player stats (841 API calls, batched)
      await this.syncAllPlayerStats(playerMap, gameweekMap, fixtureMap);

      const total = Date.now() - started;
      this.logger.log(`=== Full sync complete in ${(total / 1000).toFixed(1)}s ===`);
    } catch (err: any) {
      await this.log('full-sync', 'error', 0, Date.now() - started, err.message);
      throw err;
    }
  }

  async getRecentLogs(limit = 20): Promise<ApiSyncLog[]> {
    return this.syncLogRepo.find({
      order: { syncedAt: 'DESC' },
      take: limit,
    });
  }

  // ─── Bootstrap helpers ────────────────────────────────────────────────────

  private async upsertSeason(): Promise<Season> {
    const year = this.config.get<string>('fpl.currentSeason')!;
    // Un-mark any other season as current first — upsert only ever touches the
    // row matching `year`, so without this a season-label change (e.g.
    // 2025-26 → 2026-27) leaves two rows both flagged is_current.
    await this.seasonRepo
      .createQueryBuilder()
      .update()
      .set({ isCurrent: false })
      .where('year != :year', { year })
      .execute();
    await this.seasonRepo.upsert(
      { year, isCurrent: true },
      { conflictPaths: ['year'], skipUpdateIfNoValuesChanged: true },
    );
    return this.seasonRepo.findOneByOrFail({ year });
  }

  private async upsertPositions(elementTypes: FplElementType[]): Promise<IdMap> {
    const rows = elementTypes.map((et) => ({
      fplId: et.id,
      singularName: et.singular_name,
      singularNameShort: et.singular_name_short,
      pluralName: et.plural_name,
    }));

    await this.positionRepo.upsert(
      rows.map(r => Object.assign(this.positionRepo.create(), r)) as any,
      { conflictPaths: ['fplId'], skipUpdateIfNoValuesChanged: true },
    );

    const saved = await this.positionRepo.findBy(
      rows.map((r) => ({ fplId: r.fplId })),
    );
    return new Map(saved.map((p) => [p.fplId, p.id]));
  }

  private async upsertTeams(fplTeams: FplTeam[], seasonId: number): Promise<IdMap> {
    const rows = fplTeams.map((t) => ({
      fplId: t.id,
      seasonId,
      name: t.name,
      shortName: t.short_name,
      code: t.code,
      strengthOverallHome: t.strength_overall_home,
      strengthOverallAway: t.strength_overall_away,
      strengthAttackHome: t.strength_attack_home,
      strengthAttackAway: t.strength_attack_away,
      strengthDefenceHome: t.strength_defence_home,
      strengthDefenceAway: t.strength_defence_away,
    }));

    await this.teamRepo.upsert(
      rows.map(r => Object.assign(this.teamRepo.create(), r)) as any,
      { conflictPaths: ['fplId', 'seasonId'], skipUpdateIfNoValuesChanged: true },
    );

    const saved = await this.teamRepo.findBy(
      rows.map((r) => ({ fplId: r.fplId, seasonId })),
    );
    return new Map(saved.map((t) => [t.fplId, t.id]));
  }

  private async upsertGameweeks(fplEvents: FplEvent[], seasonId: number): Promise<IdMap> {
    const rows = fplEvents.map((e) => ({
      fplId: e.id,
      seasonId,
      name: e.name,
      deadlineTime: e.deadline_time ? new Date(e.deadline_time) : null,
      averageEntryScore: e.average_entry_score ?? null,
      highestScore: e.highest_score ?? null,
      highestScoringEntry: e.highest_scoring_entry ?? null,
      finished: e.finished,
      dataChecked: e.data_checked,
      isCurrent: e.is_current,
      isNext: e.is_next,
      isPrevious: e.is_previous,
      chipPlays: e.chip_plays ?? null,
      mostSelected: e.most_selected ?? null,
      mostTransferredIn: e.most_transferred_in ?? null,
      topElement: e.top_element ?? null,
      transfersMade: e.transfers_made ?? null,
    }));

    await this.gameweekRepo.upsert(
      rows.map(r => Object.assign(this.gameweekRepo.create(), r)) as any,
      { conflictPaths: ['fplId', 'seasonId'], skipUpdateIfNoValuesChanged: true },
    );

    const saved = await this.gameweekRepo.findBy(
      rows.map((r) => ({ fplId: r.fplId, seasonId })),
    );
    return new Map(saved.map((gw) => [gw.fplId, gw.id]));
  }

  private async upsertPlayers(
    fplElements: FplElement[],
    seasonId: number,
    teamMap: IdMap,
    positionMap: IdMap,
  ): Promise<IdMap> {
    const rows = fplElements
      .filter((e) => teamMap.has(e.team) && positionMap.has(e.element_type))
      .map((e) => ({
        fplId: e.id,
        seasonId,
        teamId: teamMap.get(e.team)!,
        positionId: positionMap.get(e.element_type)!,
        firstName: e.first_name,
        secondName: e.second_name,
        webName: e.web_name,
        code: e.code,
        status: e.status,
        news: e.news || null,
        nowCost: e.now_cost,
        costChangeStart: e.cost_change_start,
        costChangeEvent: e.cost_change_event,
        selectedByPercent: parseDecimal(e.selected_by_percent),
        totalPoints: e.total_points,
        pointsPerGame: parseDecimal(e.points_per_game),
        form: parseDecimal(e.form),
        valueForm: parseDecimal(e.value_form),
        valueSeason: parseDecimal(e.value_season),
        minutes: e.minutes,
        goalsScored: e.goals_scored,
        assists: e.assists,
        cleanSheets: e.clean_sheets,
        goalsConceded: e.goals_conceded,
        ownGoals: e.own_goals,
        penaltiesSaved: e.penalties_saved,
        penaltiesMissed: e.penalties_missed,
        yellowCards: e.yellow_cards,
        redCards: e.red_cards,
        saves: e.saves,
        bonus: e.bonus,
        bps: e.bps,
        influence: parseDecimal(e.influence),
        creativity: parseDecimal(e.creativity),
        threat: parseDecimal(e.threat),
        ictIndex: parseDecimal(e.ict_index),
        transfersIn: e.transfers_in,
        transfersOut: e.transfers_out,
        transfersInEvent: e.transfers_in_event,
        transfersOutEvent: e.transfers_out_event,
        dreamteamCount: e.dreamteam_count,
        inDreamteam: e.in_dreamteam,
      }));

    // Batch upsert in chunks of 200 to avoid query size limits
    const chunkSize = 200;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await this.playerRepo.upsert(
        rows.slice(i, i + chunkSize).map(r => Object.assign(this.playerRepo.create(), r)) as any,
        { conflictPaths: ['fplId', 'seasonId'], skipUpdateIfNoValuesChanged: true },
      );
    }

    const saved = await this.playerRepo.find({
      where: { seasonId },
      select: ['id', 'fplId'],
    });
    return new Map(saved.map((p) => [p.fplId, p.id]));
  }

  // ─── Fixtures ─────────────────────────────────────────────────────────────

  private async upsertFixtures(
    fplFixtures: FplFixture[],
    seasonId: number,
    teamMap: IdMap,
    gameweekMap: IdMap,
  ): Promise<IdMap> {
    const rows = fplFixtures
      .filter((f) => teamMap.has(f.team_h) && teamMap.has(f.team_a))
      .map((f) => ({
        fplId: f.id,
        seasonId,
        gameweekId: f.event != null ? (gameweekMap.get(f.event) ?? null) : null,
        teamHId: teamMap.get(f.team_h)!,
        teamAId: teamMap.get(f.team_a)!,
        teamHScore: f.team_h_score ?? null,
        teamAScore: f.team_a_score ?? null,
        kickoffTime: f.kickoff_time ? new Date(f.kickoff_time) : null,
        finished: f.finished,
        finishedProvisional: f.finished_provisional,
        started: f.started ?? null,
        teamHDifficulty: f.team_h_difficulty,
        teamADifficulty: f.team_a_difficulty,
        pulseId: f.pulse_id,
      }));

    await this.fixtureRepo.upsert(
      rows.map(r => Object.assign(this.fixtureRepo.create(), r)) as any,
      { conflictPaths: ['fplId'], skipUpdateIfNoValuesChanged: true },
    );

    const saved = await this.fixtureRepo.find({
      where: { seasonId },
      select: ['id', 'fplId'],
    });
    return new Map(saved.map((f) => [f.fplId, f.id]));
  }

  // ─── Per-player stats (element-summary) ───────────────────────────────────

  private async syncAllPlayerStats(
    playerMap: IdMap,
    gameweekMap: IdMap,
    fixtureMap: IdMap,
  ): Promise<void> {
    const fplIds = Array.from(playerMap.keys());
    const batchSize = 10;
    let processed = 0;
    let failed = 0;
    const totalStarted = Date.now();

    this.logger.log(`Syncing stats for ${fplIds.length} players (batches of ${batchSize})...`);

    for (let i = 0; i < fplIds.length; i += batchSize) {
      const batch = fplIds.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map((fplId) =>
          this.syncOnePlayerStats(fplId, playerMap, gameweekMap, fixtureMap),
        ),
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          processed++;
        } else {
          failed++;
          this.logger.warn(`Player stat sync failed: ${r.reason?.message}`);
        }
      }

      const done = Math.min(i + batchSize, fplIds.length);
      if (done % 100 === 0 || done === fplIds.length) {
        this.logger.log(`Player stats: ${done}/${fplIds.length} (${failed} errors)`);
      }

      // 150ms between batches — polite to the FPL API
      if (i + batchSize < fplIds.length) {
        await this.fplApi.sleep(150);
      }
    }

    const elapsed = ((Date.now() - totalStarted) / 1000).toFixed(1);
    await this.log(
      'element-summary',
      failed === 0 ? 'success' : 'partial',
      processed,
      Date.now() - totalStarted,
      failed > 0 ? `${failed} player(s) failed` : undefined,
    );
    this.logger.log(`Player stats done: ${processed} ok, ${failed} failed, ${elapsed}s`);
  }

  private async syncOnePlayerStats(
    fplId: number,
    playerMap: IdMap,
    gameweekMap: IdMap,
    fixtureMap: IdMap,
  ): Promise<void> {
    const summary = await this.fplApi.getElementSummary(fplId);
    const playerId = playerMap.get(fplId)!;

    if (!summary.history?.length) return;

    // Use Maps to deduplicate before inserting.
    // stats: unique per (gameweekId, fixtureId) — DGW players have 2 fixtures in same GW, both kept
    // ownership / price: unique per gameweekId only — last fixture's value wins for DGW
    const statMap = new Map<string, Partial<PlayerGameweekStat>>();
    const ownershipMap = new Map<number, Partial<OwnershipSnapshot>>();
    const priceMap = new Map<number, Partial<PriceHistory>>();

    for (const h of summary.history) {
      const gameweekId = gameweekMap.get(h.round);
      const fixtureId = fixtureMap.get(h.fixture);

      if (!gameweekId || !fixtureId) continue;

      statMap.set(`${gameweekId}-${fixtureId}`, {
        playerId,
        gameweekId,
        fixtureId,
        minutes: h.minutes,
        goalsScored: h.goals_scored,
        assists: h.assists,
        cleanSheets: h.clean_sheets,
        goalsConceded: h.goals_conceded,
        ownGoals: h.own_goals,
        penaltiesSaved: h.penalties_saved,
        penaltiesMissed: h.penalties_missed,
        yellowCards: h.yellow_cards,
        redCards: h.red_cards,
        saves: h.saves,
        bonus: h.bonus,
        bps: h.bps,
        influence: parseDecimal(h.influence),
        creativity: parseDecimal(h.creativity),
        threat: parseDecimal(h.threat),
        ictIndex: parseDecimal(h.ict_index),
        totalPoints: h.total_points,
        value: h.value,
        transfersBalance: h.transfers_balance,
        selected: h.selected,
        transfersIn: h.transfers_in,
        transfersOut: h.transfers_out,
        round: h.round,
        wasHome: h.was_home,
      });

      ownershipMap.set(gameweekId, {
        playerId,
        gameweekId,
        transfersIn: h.transfers_in,
        transfersOut: h.transfers_out,
      });

      priceMap.set(gameweekId, { playerId, gameweekId, price: h.value });
    }

    const statRows = Array.from(statMap.values());
    const ownershipRows = Array.from(ownershipMap.values());
    const priceRows = Array.from(priceMap.values());

    // Upsert all in parallel — these are independent tables
    await Promise.all([
      statRows.length
        ? this.pgStatRepo.upsert(
            statRows.map(r => Object.assign(this.pgStatRepo.create(), r)) as any,
            { conflictPaths: ['playerId', 'gameweekId', 'fixtureId'], skipUpdateIfNoValuesChanged: true },
          )
        : Promise.resolve(),

      ownershipRows.length
        ? this.ownershipRepo.upsert(
            ownershipRows.map(r => Object.assign(this.ownershipRepo.create(), r)) as any,
            { conflictPaths: ['playerId', 'gameweekId'], skipUpdateIfNoValuesChanged: true },
          )
        : Promise.resolve(),

      priceRows.length
        ? this.priceHistoryRepo.upsert(
            priceRows.map(r => Object.assign(this.priceHistoryRepo.create(), r)) as any,
            { conflictPaths: ['playerId', 'gameweekId'], skipUpdateIfNoValuesChanged: true },
          )
        : Promise.resolve(),
    ]);
  }

  // ─── Logging ──────────────────────────────────────────────────────────────

  private async log(
    endpoint: string,
    status: 'success' | 'error' | 'partial',
    recordsProcessed: number,
    durationMs: number,
    errorMessage?: string,
  ): Promise<void> {
    const entry = this.syncLogRepo.create({
      endpoint,
      status,
      recordsProcessed,
      durationMs,
      errorMessage: errorMessage ?? null,
    });
    await this.syncLogRepo.save(entry);
  }
}
