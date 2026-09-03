import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Player } from '../../database/entities/player.entity';
import { FplApiService } from '../sync/fpl-api.service';

// Best-effort mapping of FPL's raw chip codes to display labels. The exact
// strings are a documented convention of this unofficial API, not confirmed
// against a live response — falls back to the raw code rather than crashing
// if a code we don't recognize shows up. Confirm once a real FPL team ID
// with chip history is available.
const CHIP_LABELS: Record<string, string> = {
  wildcard: 'Wildcard',
  freehit: 'Free Hit',
  bboost: 'Bench Boost',
  '3xc': 'Triple Captain',
};

export interface FplSnapshotDto {
  managerId: number;
  teamName: string;
  managerName: string;
  overallRank: number | null;
  overallPoints: number | null;
  gameweek: number | null;
  gameweekPoints: number | null;
  captain: { webName: string; team: string | null } | null;
  chipsUsed: Array<{ code: string; label: string; event: number }>;
}

export interface FplLeagueSummaryDto {
  id: number;
  name: string;
  isGlobal: boolean;
  rank: number | null;
}

export interface FplLeagueStandingsRowDto {
  rank: number;
  entryId: number;
  teamName: string;
  managerName: string;
  totalPoints: number;
  eventPoints: number;
  isMe: boolean;
}

export interface FplTransferDto {
  event: number;
  time: string;
  playerIn: { webName: string; team: string | null } | null;
  playerOut: { webName: string; team: string | null } | null;
}

/**
 * Live-fetch only — nothing here is persisted. Every call goes straight to
 * FPL's own public API and reshapes the response; no snapshot storage, no
 * refresh cadence to manage. FPL's API is free and untroubled by this
 * traffic, unlike the paid odds providers, so there's no cost pressure
 * forcing the heavier sync-and-store pattern used elsewhere in this app.
 */
@Injectable()
export class FplProfileService {
  private readonly logger = new Logger(FplProfileService.name);

  constructor(
    private readonly fplApi: FplApiService,
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
  ) {}

  private parseManagerId(fplTeamId: string | null): number {
    if (!fplTeamId) {
      throw new BadRequestException('Link your FPL team ID first.');
    }
    const id = parseInt(fplTeamId, 10);
    if (!Number.isFinite(id) || id <= 0) {
      throw new BadRequestException('Invalid FPL team ID.');
    }
    return id;
  }

  async getSnapshot(fplTeamId: string | null): Promise<FplSnapshotDto> {
    const managerId = this.parseManagerId(fplTeamId);
    const [entry, history] = await Promise.all([
      this.fplApi.getEntry(managerId),
      this.fplApi.getEntryHistory(managerId),
    ]);

    let captain: FplSnapshotDto['captain'] = null;
    if (entry.current_event) {
      try {
        const picks = await this.fplApi.getEntryPicks(managerId, entry.current_event);
        const captainPick = picks.picks.find((p) => p.is_captain);
        if (captainPick) {
          const player = await this.playerRepo.findOne({
            where: { fplId: captainPick.element },
            relations: ['team'],
          });
          if (player) captain = { webName: player.webName, team: player.team?.shortName ?? null };
        }
      } catch (err: any) {
        // Picks for the current gameweek can be unavailable in some
        // situations (e.g. before the season's first deadline) — the
        // captain line just doesn't show rather than failing the snapshot.
        this.logger.warn(`Could not load picks for manager ${managerId}, event ${entry.current_event}: ${err.message}`);
      }
    }

    const chipsUsed = (history.chips ?? []).map((c) => ({
      code: c.name,
      label: CHIP_LABELS[c.name] ?? c.name,
      event: c.event,
    }));

    return {
      managerId,
      teamName: entry.name,
      managerName: `${entry.player_first_name} ${entry.player_last_name}`.trim(),
      overallRank: entry.summary_overall_rank,
      overallPoints: entry.summary_overall_points,
      gameweek: entry.current_event,
      gameweekPoints: entry.summary_event_points,
      captain,
      chipsUsed,
    };
  }

  async getLeagues(fplTeamId: string | null): Promise<{ managerId: number; leagues: FplLeagueSummaryDto[] }> {
    const managerId = this.parseManagerId(fplTeamId);
    const entry = await this.fplApi.getEntry(managerId);
    const leagues = (entry.leagues?.classic ?? [])
      .map((l) => ({
        id: l.id,
        name: l.name,
        isGlobal: l.league_type === 's',
        rank: l.entry_rank ?? null,
      }))
      // Private leagues first — standing in a multi-million-entry global
      // league isn't the meaningful "who's leading" view users actually want.
      .sort((a, b) => Number(a.isGlobal) - Number(b.isGlobal));
    return { managerId, leagues };
  }

  async getLeagueStandings(
    fplTeamId: string | null,
    leagueId: number,
  ): Promise<{ leagueId: number; leagueName: string | null; standings: FplLeagueStandingsRowDto[] }> {
    const managerId = this.parseManagerId(fplTeamId);
    const data = await this.fplApi.getClassicLeagueStandings(leagueId);
    const results = data.standings?.results ?? [];
    return {
      leagueId,
      leagueName: data.league?.name ?? null,
      standings: results.map((r) => ({
        rank: r.rank,
        entryId: r.entry,
        teamName: r.entry_name,
        managerName: r.player_name,
        totalPoints: r.total,
        eventPoints: r.event_total,
        isMe: r.entry === managerId,
      })),
    };
  }

  async getTransfers(fplTeamId: string | null): Promise<{ managerId: number; transfers: FplTransferDto[] }> {
    const managerId = this.parseManagerId(fplTeamId);
    const raw = await this.fplApi.getEntryTransfers(managerId);

    // One batched lookup for every player involved, rather than a query per
    // transfer — a season's worth of transfers is a small, bounded list, but
    // no reason to make it N+1.
    const elementIds = Array.from(new Set(raw.flatMap((t) => [t.element_in, t.element_out])));
    const players = elementIds.length
      ? await this.playerRepo.find({ where: { fplId: In(elementIds) }, relations: ['team'] })
      : [];
    const byFplId = new Map(players.map((p) => [p.fplId, p]));
    const toPlayerRef = (fplId: number) => {
      const p = byFplId.get(fplId);
      return p ? { webName: p.webName, team: p.team?.shortName ?? null } : null;
    };

    const transfers = raw
      .map((t) => ({
        event: t.event,
        time: t.time,
        playerIn: toPlayerRef(t.element_in),
        playerOut: toPlayerRef(t.element_out),
      }))
      // Don't trust FPL's own response order — sort explicitly, newest first.
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return { managerId, transfers };
  }
}
