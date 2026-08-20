/**
 * Leaderboard data source. No scoring backend exists yet (picks aren't
 * graded against real gameweek results), so this is intentionally empty
 * for now (2026-08-20) rather than showing fictional standings — real rows
 * will come from the API once that scoring logic exists. The shape/types
 * below stay in place so the tabs/rows UI has something to build against.
 */
export interface ExpertRow {
  id: string;
  name: string;
  handle: string;
  score: number;
  delta: number;
  topMove: string;
  byChallenge: { transfer: number; differential: number; strategy: number };
  hitRate: number;
  streak: number;
  recentPicks: string[];
}

export type LeaderboardKey = 'oracle' | 'transfer' | 'differential' | 'strategy';

const BASE_EXPERTS: ExpertRow[] = [];

const LEADERBOARDS: Record<LeaderboardKey, ExpertRow[]> = {
  oracle: BASE_EXPERTS,
  transfer: [...BASE_EXPERTS].sort((a, b) => b.byChallenge.transfer - a.byChallenge.transfer),
  differential: [...BASE_EXPERTS].sort((a, b) => b.byChallenge.differential - a.byChallenge.differential),
  strategy: [...BASE_EXPERTS].sort((a, b) => b.byChallenge.strategy - a.byChallenge.strategy),
};

export function getLeaderboard(key: LeaderboardKey): ExpertRow[] {
  return LEADERBOARDS[key];
}
