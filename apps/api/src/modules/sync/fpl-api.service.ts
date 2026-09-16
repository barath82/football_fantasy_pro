import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  FplBootstrapStatic,
  FplFixture,
  FplElementSummary,
} from '@fantasy/types';

// ─── Manager/profile types ─────────────────────────────────────────────────
// Shapes for FPL's unofficial per-manager endpoints, used by the FPL-profile
// feature (My Picks). Documented from general knowledge of this widely-used
// API, not yet confirmed against a live response — confirm field names once
// a real FPL team ID has been run through this.

export interface FplClassicLeagueMembership {
  id: number;
  name: string;
  league_type: string; // 's' = system/global league (e.g. "Overall"), 'x' = classic league someone created — unverified
  entry_rank: number | null;
}

export interface FplEntry {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number | null;
  summary_overall_rank: number | null;
  summary_event_points: number | null;
  current_event: number | null;
  leagues: {
    classic: FplClassicLeagueMembership[];
  };
}

// Verified directly against a real manager's response (2026-09-16) — see
// entry_history below for the identical per-event shape confirmed live.
export interface FplEntryHistoryRow {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  overall_rank: number;
  percentile_rank: number;
  overall_rank_percentage: string; // e.g. "68" — FPL's own "top X%", already computed, not ours to derive
  event_transfers: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

export interface FplEntryHistory {
  current: FplEntryHistoryRow[];
  chips: Array<{ name: string; event: number; time: string }>;
}

export interface FplPick {
  element: number;
  element_type: number; // position id — 1 GKP, 2 DEF, 3 MID, 4 FWD
  position: number; // 1-11 originally-selected starting XI, 12-15 bench
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface FplAutomaticSub {
  element_in: number;
  element_out: number;
  event: number;
}

// Verified live: FPL reports the auto-sub outcome directly — no need to
// simulate their substitution rules (bench order, GK-for-GK, formation
// validity) ourselves.
export interface FplPicksResponse {
  active_chip: string | null;
  automatic_subs: FplAutomaticSub[];
  entry_history: FplEntryHistoryRow;
  picks: FplPick[];
}

// One call returns every player's stats for a single gameweek — used for
// captaincy/lineup efficiency instead of N per-player element-summary calls.
export interface FplEventLiveElement {
  id: number;
  stats: {
    minutes: number;
    total_points: number;
    bonus: number;
  };
}

export interface FplEventLive {
  elements: FplEventLiveElement[];
}

export interface FplTransfer {
  element_in: number;
  element_in_cost: number;
  element_out: number;
  element_out_cost: number;
  event: number;
  time: string;
}

export interface FplClassicStandingsResponse {
  league: { id: number; name: string };
  standings: {
    has_next: boolean;
    results: Array<{
      entry: number;
      entry_name: string;
      player_name: string;
      rank: number;
      total: number;
      event_total: number;
    }>;
  };
}

@Injectable()
export class FplApiService {
  private readonly logger = new Logger(FplApiService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.client = axios.create({
      baseURL: this.config.get<string>('fpl.baseUrl'),
      timeout: 30_000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
  }

  async getBootstrapStatic(): Promise<FplBootstrapStatic> {
    return this.get<FplBootstrapStatic>('/bootstrap-static/');
  }

  async getFixtures(): Promise<FplFixture[]> {
    return this.get<FplFixture[]>('/fixtures/');
  }

  async getElementSummary(elementId: number): Promise<FplElementSummary> {
    return this.get<FplElementSummary>(`/element-summary/${elementId}/`);
  }

  async getEntry(managerId: number): Promise<FplEntry> {
    return this.get<FplEntry>(`/entry/${managerId}/`);
  }

  async getEntryHistory(managerId: number): Promise<FplEntryHistory> {
    return this.get<FplEntryHistory>(`/entry/${managerId}/history/`);
  }

  async getEntryPicks(managerId: number, event: number): Promise<FplPicksResponse> {
    return this.get<FplPicksResponse>(`/entry/${managerId}/event/${event}/picks/`);
  }

  async getClassicLeagueStandings(leagueId: number): Promise<FplClassicStandingsResponse> {
    return this.get<FplClassicStandingsResponse>(`/leagues-classic/${leagueId}/standings/`);
  }

  async getEntryTransfers(managerId: number): Promise<FplTransfer[]> {
    return this.get<FplTransfer[]>(`/entry/${managerId}/transfers/`);
  }

  async getEventLive(event: number): Promise<FplEventLive> {
    return this.get<FplEventLive>(`/event/${event}/live/`);
  }

  private async get<T>(path: string, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data } = await this.client.get<T>(path);
        return data;
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 429 || (status >= 500 && attempt < retries)) {
          const delay = 1_000 * attempt;
          this.logger.warn(
            `${path} → HTTP ${status}, retry ${attempt}/${retries} in ${delay}ms`,
          );
          await this.sleep(delay);
          continue;
        }

        throw err;
      }
    }
    throw new Error(`Failed after ${retries} attempts: ${path}`);
  }

  sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
