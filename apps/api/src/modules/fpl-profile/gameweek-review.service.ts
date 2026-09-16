import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Season } from '../../database/entities/season.entity';
import { Player } from '../../database/entities/player.entity';
import { OwnershipSnapshot } from '../../database/entities/ownership-snapshot.entity';
import { FplApiService, FplEntryHistoryRow, FplPicksResponse, FplEventLive } from '../sync/fpl-api.service';
import { parseManagerId } from './parse-manager-id.util';

const DIFFERENTIAL_LOW_OWNERSHIP = 15; // below this counts as "a differential" for the boost side
const TEMPLATE_HIGH_OWNERSHIP = 30; // above this counts as "template" for the damage side
const SEASON_CONTEXT_CACHE_TTL_MS = 60 * 60 * 1000; // 1h — a finished gameweek's numbers never change, this just caps re-fetch cost

export interface RankImpactDto {
  points: number;
  average: number | null;
  vsAverage: number | null;
  overallRank: number;
  previousOverallRank: number | null;
  rankMovement: number | null; // positive = improved (rank number went down)
  topPercent: number | null; // FPL's own "top X%" for that gameweek, taken as-is
}

export interface PlayerRefDto {
  webName: string;
  team: string | null;
  points: number;
}

export interface TransferPairDto {
  playerIn: PlayerRefDto | null;
  playerOut: PlayerRefDto | null;
  gain: number; // playerIn.points - playerOut.points
  threeGw: { playerInPoints: number; playerOutPoints: number; impact: number; gameweeksCounted: number } | null;
}

export interface TransferImpactDto {
  chip: 'wildcard' | 'freehit' | null; // non-null means pairs below are intentionally empty
  hitCost: number;
  pairs: TransferPairDto[];
  combinedNetImpact: number | null; // null when a chip was played or there were no transfers
}

export interface CaptaincyDto {
  captain: (PlayerRefDto & { multiplier: number }) | null;
  bestAvailable: PlayerRefDto | null;
  efficiency: number | null; // 0-100, base points captain / base points of best available in the actual XI
  missedPoints: number | null;
  isTripleCaptain: boolean;
  captainDidNotPlay: boolean;
}

export interface LineupEfficiencyDto {
  chip: 'bboost' | null; // Bench Boost counts the whole squad — no bench to compare against
  actualPoints: number | null;
  bestPossiblePoints: number | null;
  efficiency: number | null;
  missedPoints: number | null;
  biggestMiss: { benched: PlayerRefDto; startedInstead: PlayerRefDto } | null;
}

export interface DifferentialPlayerDto extends PlayerRefDto {
  ownershipPercent: number;
}

export interface DifferentialImpactDto {
  ownershipDataAvailable: boolean; // false = no snapshot captured for this gameweek — never approximated with today's ownership
  biggestBoost: DifferentialPlayerDto | null; // manager's own low-owned player who scored well
  biggestTemplateDamage: DifferentialPlayerDto | null; // high-owned player the manager didn't have, who scored well
}

export interface BestDecisionDto {
  type: 'transfer' | 'captaincy' | 'differential';
  headline: string;
  detail: string;
}

export interface BiggestMissDto {
  type: 'lineup' | 'captaincy' | 'transfer';
  headline: string;
  detail: string;
}

export interface SeasonContextDto {
  gameweeksCounted: number;
  seasonTransferImpact: number | null;
  seasonCaptaincyEfficiency: number | null;
  averageLineupEfficiency: number | null;
}

export interface GameweekReviewDto {
  gameweek: number;
  rankImpact: RankImpactDto;
  transferImpact: TransferImpactDto;
  captaincy: CaptaincyDto;
  lineupEfficiency: LineupEfficiencyDto;
  differentialImpact: DifferentialImpactDto;
  bestDecision: BestDecisionDto | null;
  biggestMiss: BiggestMissDto | null;
}

const OUTFIELD_COMBOS: Array<{ def: number; mid: number; fwd: number }> = (() => {
  const combos: Array<{ def: number; mid: number; fwd: number }> = [];
  for (let def = 3; def <= 5; def++) {
    for (let fwd = 1; fwd <= 3; fwd++) {
      const mid = 10 - def - fwd;
      if (mid >= 2 && mid <= 5) combos.push({ def, mid, fwd });
    }
  }
  return combos;
})();

/**
 * Personal Gameweek Review (Phase 1) — live-fetched from FPL on every call,
 * same as the rest of the fpl-profile feature. Only ever built for a
 * *finished* gameweek — an in-progress week's numbers aren't final yet, so
 * presenting them as a "review" would be misleading.
 */
@Injectable()
export class GameweekReviewService {
  constructor(
    private readonly fplApi: FplApiService,
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
    @InjectRepository(Gameweek) private readonly gwRepo: Repository<Gameweek>,
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
    @InjectRepository(OwnershipSnapshot) private readonly ownershipRepo: Repository<OwnershipSnapshot>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getReview(fplTeamId: string | null, requestedGw?: number): Promise<GameweekReviewDto> {
    const managerId = parseManagerId(fplTeamId);
    const season = await this.seasonRepo.findOneBy({ isCurrent: true });
    if (!season) throw new NotFoundException('No current season configured.');

    const gameweek = requestedGw
      ? await this.gwRepo.findOneBy({ seasonId: season.id, fplId: requestedGw })
      : await this.gwRepo.findOne({ where: { seasonId: season.id, finished: true }, order: { fplId: 'DESC' } });

    if (!gameweek) {
      throw new NotFoundException(
        requestedGw ? `Gameweek ${requestedGw} not found.` : 'No completed gameweek yet this season.',
      );
    }
    if (!gameweek.finished) {
      throw new BadRequestException(`Gameweek ${gameweek.fplId} hasn't finished yet — no review available.`);
    }

    const [history, picks, live] = await Promise.all([
      this.fplApi.getEntryHistory(managerId),
      this.fplApi.getEntryPicks(managerId, gameweek.fplId),
      this.fplApi.getEventLive(gameweek.fplId),
    ]);

    const row = history.current.find((r) => r.event === gameweek.fplId);
    if (!row) throw new NotFoundException(`No data for gameweek ${gameweek.fplId} for this manager.`);
    const prevRow = history.current.find((r) => r.event === gameweek.fplId - 1) ?? null;

    const rankImpact: RankImpactDto = {
      points: row.points,
      average: gameweek.averageEntryScore,
      vsAverage: gameweek.averageEntryScore != null ? row.points - gameweek.averageEntryScore : null,
      overallRank: row.overall_rank,
      previousOverallRank: prevRow?.overall_rank ?? null,
      rankMovement: prevRow ? prevRow.overall_rank - row.overall_rank : null,
      topPercent: row.overall_rank_percentage != null ? Number(row.overall_rank_percentage) : null,
    };

    // Everything below needs every squad player's name/team resolved once.
    const squadIds = picks.picks.map((p) => p.element);
    const players = await this.playerRepo.find({ where: { fplId: In(squadIds) }, relations: ['team'] });
    const byFplId = new Map(players.map((p) => [p.fplId, p]));
    const pointsByElement = new Map(live.elements.map((e) => [e.id, e.stats.total_points]));
    const ref = (id: number): PlayerRefDto => {
      const p = byFplId.get(id);
      return { webName: p?.webName ?? 'Unknown', team: p?.team?.shortName ?? null, points: pointsByElement.get(id) ?? 0 };
    };

    const transferImpact = await this.buildTransferImpact(managerId, gameweek.fplId, row, season.id, picks, pointsByElement, byFplId);
    const captaincy = this.buildCaptaincy(picks, pointsByElement, live, ref);
    const lineupEfficiency = this.buildLineupEfficiency(picks, pointsByElement, ref);
    const differentialImpact = await this.buildDifferentialImpact(gameweek.id, squadIds, pointsByElement);
    const bestDecision = this.pickBestDecision(transferImpact, captaincy, differentialImpact);
    const biggestMiss = this.pickBiggestMiss(transferImpact, captaincy, lineupEfficiency);

    return {
      gameweek: gameweek.fplId,
      rankImpact,
      transferImpact,
      captaincy,
      lineupEfficiency,
      differentialImpact,
      bestDecision,
      biggestMiss,
    };
  }

  // ─── Best Decision / Biggest Miss ───────────────────────────────────────
  // Derived from the four dimensions above — whichever has the largest
  // measurable positive (or negative) swing wins. Constructive language
  // even for the miss, per the Phase 1 spec.

  private pickBestDecision(
    transferImpact: TransferImpactDto,
    captaincy: CaptaincyDto,
    differentialImpact: DifferentialImpactDto,
  ): BestDecisionDto | null {
    const candidates: Array<{ magnitude: number; dto: BestDecisionDto }> = [];

    const bestTransfer = transferImpact.pairs.length
      ? transferImpact.pairs.reduce((b, p) => (p.gain > b.gain ? p : b))
      : null;
    if (bestTransfer && bestTransfer.gain > 0 && bestTransfer.playerIn) {
      candidates.push({
        magnitude: bestTransfer.gain,
        dto: { type: 'transfer', headline: `Bringing in ${bestTransfer.playerIn.webName}`, detail: `+${bestTransfer.gain} pts` },
      });
    }
    if (captaincy.captain && captaincy.efficiency === 100 && !captaincy.captainDidNotPlay) {
      candidates.push({
        magnitude: captaincy.captain.points,
        dto: { type: 'captaincy', headline: `Captaining ${captaincy.captain.webName}`, detail: 'Best captain available in your XI' },
      });
    }
    if (differentialImpact.biggestBoost) {
      candidates.push({
        magnitude: differentialImpact.biggestBoost.points,
        dto: {
          type: 'differential',
          headline: `${differentialImpact.biggestBoost.webName} differential`,
          detail: `${differentialImpact.biggestBoost.points} pts at ${differentialImpact.biggestBoost.ownershipPercent}% ownership`,
        },
      });
    }

    if (!candidates.length) return null;
    return candidates.sort((a, b) => b.magnitude - a.magnitude)[0].dto;
  }

  private pickBiggestMiss(
    transferImpact: TransferImpactDto,
    captaincy: CaptaincyDto,
    lineupEfficiency: LineupEfficiencyDto,
  ): BiggestMissDto | null {
    const candidates: Array<{ magnitude: number; dto: BiggestMissDto }> = [];

    if (lineupEfficiency.biggestMiss) {
      const missed = lineupEfficiency.biggestMiss.benched.points - lineupEfficiency.biggestMiss.startedInstead.points;
      candidates.push({
        magnitude: missed,
        dto: {
          type: 'lineup',
          headline: `Benched ${lineupEfficiency.biggestMiss.benched.webName}`,
          detail: `${lineupEfficiency.biggestMiss.benched.points} potential points missed`,
        },
      });
    }
    if (captaincy.missedPoints) {
      candidates.push({
        magnitude: captaincy.missedPoints,
        dto: {
          type: 'captaincy',
          headline: 'Captaincy',
          detail: `${captaincy.bestAvailable?.webName ?? 'Another player'} scored ${captaincy.missedPoints} more points than your captain.`,
        },
      });
    }
    const worstTransfer = transferImpact.pairs.length
      ? transferImpact.pairs.reduce((b, p) => (p.gain < b.gain ? p : b))
      : null;
    if (worstTransfer && worstTransfer.gain < 0) {
      candidates.push({
        magnitude: -worstTransfer.gain,
        dto: { type: 'transfer', headline: 'Transfer', detail: `Your outgoing player outscored your incoming player by ${-worstTransfer.gain} points.` },
      });
    }

    if (!candidates.length) return null;
    return candidates.sort((a, b) => b.magnitude - a.magnitude)[0].dto;
  }

  // ─── Season Context ─────────────────────────────────────────────────────
  // Deliberately lightweight, not a season dashboard — three numbers, no
  // player-level detail, no 3-GW/differential tracking. Still costs 2 FPL
  // calls per finished gameweek (picks + live), which grows across a season,
  // so the result is cached for an hour keyed to the latest finished
  // gameweek — a finished week's numbers never change, so this is safe to
  // treat as expensive-but-rare rather than needing real invalidation logic.

  async getSeasonContext(fplTeamId: string | null): Promise<SeasonContextDto> {
    const managerId = parseManagerId(fplTeamId);
    const season = await this.seasonRepo.findOneBy({ isCurrent: true });
    if (!season) throw new NotFoundException('No current season configured.');

    const finishedGws = await this.gwRepo.find({ where: { seasonId: season.id, finished: true }, order: { fplId: 'ASC' } });
    if (!finishedGws.length) {
      return { gameweeksCounted: 0, seasonTransferImpact: null, seasonCaptaincyEfficiency: null, averageLineupEfficiency: null };
    }

    const cacheKey = `season-context:${managerId}:${finishedGws[finishedGws.length - 1].fplId}`;
    const cached = await this.cache.get<SeasonContextDto>(cacheKey);
    if (cached) return cached;

    const [history, allTransfers] = await Promise.all([
      this.fplApi.getEntryHistory(managerId),
      this.fplApi.getEntryTransfers(managerId),
    ]);
    const transfersByEvent = new Map<number, typeof allTransfers>();
    for (const t of allTransfers) {
      const bucket = transfersByEvent.get(t.event) ?? [];
      bucket.push(t);
      transfersByEvent.set(t.event, bucket);
    }

    const emptyRef = (id: number, pointsByElement: Map<number, number>): PlayerRefDto => ({
      webName: '',
      team: null,
      points: pointsByElement.get(id) ?? 0,
    });

    let seasonTransferImpact = 0;
    const captaincyEffs: number[] = [];
    const lineupEffs: number[] = [];

    for (const gw of finishedGws) {
      const row = history.current.find((r) => r.event === gw.fplId);
      if (!row) continue;

      const [picks, live] = await Promise.all([
        this.fplApi.getEntryPicks(managerId, gw.fplId),
        this.fplApi.getEventLive(gw.fplId),
      ]);
      const pointsByElement = new Map(live.elements.map((e) => [e.id, e.stats.total_points]));
      const ref = (id: number) => emptyRef(id, pointsByElement);

      if (picks.active_chip !== 'wildcard' && picks.active_chip !== 'freehit') {
        const gwTransfers = transfersByEvent.get(gw.fplId) ?? [];
        const gain = gwTransfers.reduce(
          (s, t) => s + (pointsByElement.get(t.element_in) ?? 0) - (pointsByElement.get(t.element_out) ?? 0),
          0,
        );
        seasonTransferImpact += gain - row.event_transfers_cost;
      }

      const captaincy = this.buildCaptaincy(picks, pointsByElement, live, ref);
      if (captaincy.efficiency != null) captaincyEffs.push(captaincy.efficiency);

      const lineup = this.buildLineupEfficiency(picks, pointsByElement, ref);
      if (lineup.efficiency != null) lineupEffs.push(lineup.efficiency);
    }

    const avg = (nums: number[]) => (nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null);
    const result: SeasonContextDto = {
      gameweeksCounted: finishedGws.length,
      seasonTransferImpact,
      seasonCaptaincyEfficiency: avg(captaincyEffs),
      averageLineupEfficiency: avg(lineupEffs),
    };

    await this.cache.set(cacheKey, result, SEASON_CONTEXT_CACHE_TTL_MS);
    return result;
  }

  // ─── Transfer Impact ────────────────────────────────────────────────────

  private async buildTransferImpact(
    managerId: number,
    gwFplId: number,
    row: FplEntryHistoryRow,
    seasonId: number,
    picks: FplPicksResponse,
    pointsByElement: Map<number, number>,
    byFplId: Map<number, Player>,
  ): Promise<TransferImpactDto> {
    if (picks.active_chip === 'wildcard' || picks.active_chip === 'freehit') {
      // A chip rebuild can touch the whole squad at once — pairing each
      // swap individually isn't meaningful the way a normal 1-2 transfer
      // week is, so this is intentionally not broken down further in Phase 1.
      return { chip: picks.active_chip, hitCost: row.event_transfers_cost, pairs: [], combinedNetImpact: null };
    }

    const allTransfers = await this.fplApi.getEntryTransfers(managerId);
    const gwTransfers = allTransfers.filter((t) => t.event === gwFplId);
    if (gwTransfers.length === 0) {
      return { chip: null, hitCost: 0, pairs: [], combinedNetImpact: null };
    }

    // Transferred-in players may not be in this GW's squad-name lookup if
    // they were later transferred out again before this review — resolve
    // any missing ones directly rather than assuming byFplId already has them.
    const missingIds = Array.from(new Set(gwTransfers.flatMap((t) => [t.element_in, t.element_out]))).filter(
      (id) => !byFplId.has(id),
    );
    if (missingIds.length) {
      const extra = await this.playerRepo.find({ where: { fplId: In(missingIds) }, relations: ['team'] });
      extra.forEach((p) => byFplId.set(p.fplId, p));
    }
    const ref = (id: number): PlayerRefDto => {
      const p = byFplId.get(id);
      return { webName: p?.webName ?? 'Unknown', team: p?.team?.shortName ?? null, points: pointsByElement.get(id) ?? 0 };
    };

    const latestFinishedGw = await this.gwRepo.findOne({
      where: { seasonId, finished: true },
      order: { fplId: 'DESC' },
    });

    const pairs: TransferPairDto[] = await Promise.all(
      gwTransfers.map(async (t) => {
        const playerIn = ref(t.element_in);
        const playerOut = ref(t.element_out);
        return {
          playerIn,
          playerOut,
          gain: playerIn.points - playerOut.points,
          threeGw: await this.buildThreeGwImpact(t.element_in, t.element_out, gwFplId, latestFinishedGw?.fplId ?? gwFplId),
        };
      }),
    );

    const totalGain = pairs.reduce((sum, p) => sum + p.gain, 0);
    return { chip: null, hitCost: row.event_transfers_cost, pairs, combinedNetImpact: totalGain - row.event_transfers_cost };
  }

  private async buildThreeGwImpact(
    elementIn: number,
    elementOut: number,
    startGw: number,
    latestFinishedGw: number,
  ): Promise<TransferPairDto['threeGw']> {
    const endGw = Math.min(startGw + 2, latestFinishedGw);
    if (endGw < startGw) return null; // no subsequent finished gameweek yet

    const [inSummary, outSummary] = await Promise.all([
      this.fplApi.getElementSummary(elementIn),
      this.fplApi.getElementSummary(elementOut),
    ]);
    const sumRange = (history: Array<{ round: number; total_points: number }>) =>
      history.filter((h) => h.round >= startGw && h.round <= endGw).reduce((s, h) => s + h.total_points, 0);

    const playerInPoints = sumRange(inSummary.history);
    const playerOutPoints = sumRange(outSummary.history);
    return {
      playerInPoints,
      playerOutPoints,
      impact: playerInPoints - playerOutPoints,
      gameweeksCounted: endGw - startGw + 1,
    };
  }

  // ─── Captaincy Efficiency ───────────────────────────────────────────────
  // "multiplier >= 2" on a pick reflects FPL's own resolved outcome for the
  // gameweek — if the named captain didn't play, FPL already promotes the
  // vice-captain and applies the multiplier to them instead, so reading
  // `multiplier` directly gives the real effective captain with no need to
  // simulate the VC-promotion rule ourselves.

  private buildCaptaincy(
    picks: FplPicksResponse,
    pointsByElement: Map<number, number>,
    live: FplEventLive,
    ref: (id: number) => PlayerRefDto,
  ): CaptaincyDto {
    const effectiveCaptainPick = picks.picks.find((p) => p.multiplier >= 2);
    if (!effectiveCaptainPick) {
      return { captain: null, bestAvailable: null, efficiency: null, missedPoints: null, isTripleCaptain: false, captainDidNotPlay: false };
    }

    const minutesByElement = new Map(live.elements.map((e) => [e.id, e.stats.minutes]));
    const subMap = new Map(picks.automatic_subs.map((s) => [s.element_out, s.element_in]));
    const originalStarterIds = picks.picks.filter((p) => p.position <= 11).map((p) => p.element);
    const actualXiIds = originalStarterIds.map((id) => subMap.get(id) ?? id);

    const capId = effectiveCaptainPick.element;
    const capPoints = pointsByElement.get(capId) ?? 0;
    const captainDidNotPlay = (minutesByElement.get(capId) ?? 0) === 0;

    const xiPoints = actualXiIds.map((id) => ({ id, points: pointsByElement.get(id) ?? 0 }));
    const best = xiPoints.reduce((b, c) => (c.points > b.points ? c : b), xiPoints[0] ?? { id: capId, points: capPoints });

    const efficiency = best.points > 0 ? Math.round((capPoints / best.points) * 100) : 100;

    return {
      captain: { ...ref(capId), multiplier: effectiveCaptainPick.multiplier },
      bestAvailable: ref(best.id),
      efficiency,
      missedPoints: Math.max(0, best.points - capPoints),
      isTripleCaptain: picks.active_chip === '3xc',
      captainDidNotPlay,
    };
  }

  // ─── Lineup Efficiency ──────────────────────────────────────────────────
  // Compares the ACTUAL final scoring XI (starting XI with FPL's own
  // reported automatic_subs already applied) against the best-possible
  // *legal* XI from the same 15-player squad — 1 GK, 3-5 DEF, 2-5 MID,
  // 1-3 FWD. Both sides use base (non-captain-multiplied) points, since
  // this is meant to isolate "who did I start" from "who did I captain" —
  // captaincy is judged separately above.

  private buildLineupEfficiency(
    picks: FplPicksResponse,
    pointsByElement: Map<number, number>,
    ref: (id: number) => PlayerRefDto,
  ): LineupEfficiencyDto {
    if (picks.active_chip === 'bboost') {
      return { chip: 'bboost', actualPoints: null, bestPossiblePoints: null, efficiency: null, missedPoints: null, biggestMiss: null };
    }

    const withPoints = (elementType: number) =>
      picks.picks
        .filter((p) => p.element_type === elementType)
        .map((p) => ({ id: p.element, points: pointsByElement.get(p.element) ?? 0 }))
        .sort((a, b) => b.points - a.points);

    const gks = withPoints(1);
    const defs = withPoints(2);
    const mids = withPoints(3);
    const fwds = withPoints(4);

    const bestGk = gks[0];
    let bestOutfield: { ids: number[]; total: number } = { ids: [], total: -Infinity };
    for (const { def, mid, fwd } of OUTFIELD_COMBOS) {
      if (def > defs.length || mid > mids.length || fwd > fwds.length) continue;
      const chosen = [...defs.slice(0, def), ...mids.slice(0, mid), ...fwds.slice(0, fwd)];
      const total = chosen.reduce((s, p) => s + p.points, 0);
      if (total > bestOutfield.total) bestOutfield = { ids: chosen.map((p) => p.id), total };
    }
    const bestXiIds = new Set([bestGk.id, ...bestOutfield.ids]);
    const bestPossiblePoints = bestGk.points + bestOutfield.total;

    const subMap = new Map(picks.automatic_subs.map((s) => [s.element_out, s.element_in]));
    const originalStarterIds = picks.picks.filter((p) => p.position <= 11).map((p) => p.element);
    const actualXiIds = originalStarterIds.map((id) => subMap.get(id) ?? id);
    const actualPoints = actualXiIds.reduce((s, id) => s + (pointsByElement.get(id) ?? 0), 0);
    const actualSet = new Set(actualXiIds);

    const shouldHaveStarted = [...bestXiIds]
      .filter((id) => !actualSet.has(id))
      .map((id) => ({ id, points: pointsByElement.get(id) ?? 0 }));
    const wronglyStarted = actualXiIds
      .filter((id) => !bestXiIds.has(id))
      .map((id) => ({ id, points: pointsByElement.get(id) ?? 0 }));

    let biggestMiss: LineupEfficiencyDto['biggestMiss'] = null;
    if (shouldHaveStarted.length && wronglyStarted.length) {
      const bestMissed = shouldHaveStarted.reduce((b, c) => (c.points > b.points ? c : b));
      const worstStarted = wronglyStarted.reduce((b, c) => (c.points < b.points ? c : b));
      if (bestMissed.points > worstStarted.points) {
        biggestMiss = { benched: ref(bestMissed.id), startedInstead: ref(worstStarted.id) };
      }
    }

    const efficiency = bestPossiblePoints > 0 ? Math.round((actualPoints / bestPossiblePoints) * 100) : 100;

    return {
      chip: null,
      actualPoints,
      bestPossiblePoints,
      efficiency,
      missedPoints: Math.max(0, bestPossiblePoints - actualPoints),
      biggestMiss,
    };
  }

  // ─── Differential Impact ────────────────────────────────────────────────
  // Never falls back to today's live ownership for a past gameweek — if no
  // snapshot was captured for this gameweek's deadline (the cron job in
  // ownership-snapshot-cron.service.ts), this honestly reports unavailable
  // rather than pretending current ownership reflects that week.

  private async buildDifferentialImpact(
    gameweekId: number,
    squadFplIds: number[],
    pointsByElement: Map<number, number>,
  ): Promise<DifferentialImpactDto> {
    const snapshots = await this.ownershipRepo.find({
      where: { gameweekId },
      relations: ['player', 'player.team'],
    });
    if (snapshots.length === 0) {
      return { ownershipDataAvailable: false, biggestBoost: null, biggestTemplateDamage: null };
    }

    const squadSet = new Set(squadFplIds);
    let biggestBoost: DifferentialPlayerDto | null = null;
    let biggestTemplateDamage: DifferentialPlayerDto | null = null;

    for (const snap of snapshots) {
      if (snap.selectedByPercent == null) continue;
      const ownership = Number(snap.selectedByPercent);
      const points = pointsByElement.get(snap.player.fplId) ?? 0;
      const isMine = squadSet.has(snap.player.fplId);

      if (isMine && ownership < DIFFERENTIAL_LOW_OWNERSHIP) {
        if (!biggestBoost || points > biggestBoost.points) {
          biggestBoost = { webName: snap.player.webName, team: snap.player.team?.shortName ?? null, points, ownershipPercent: ownership };
        }
      }
      if (!isMine && ownership >= TEMPLATE_HIGH_OWNERSHIP) {
        if (!biggestTemplateDamage || points > biggestTemplateDamage.points) {
          biggestTemplateDamage = { webName: snap.player.webName, team: snap.player.team?.shortName ?? null, points, ownershipPercent: ownership };
        }
      }
    }

    return { ownershipDataAvailable: true, biggestBoost, biggestTemplateDamage };
  }
}
