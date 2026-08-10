/**
 * Placeholder leaderboard data. No scoring backend exists yet (picks aren't
 * graded against real gameweek results) — this stands in for it per
 * lovable_plan.md's "out of scope" list. Names/handles are fictional
 * placeholders, not real people or accounts.
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

const BASE_EXPERTS: ExpertRow[] = [
  {
    id: 'e1',
    name: 'Dave Okoye',
    handle: '@dave_fpl',
    score: 87,
    delta: 4,
    topMove: 'Captained Haaland',
    byChallenge: { transfer: 29, differential: 31, strategy: 27 },
    hitRate: 68,
    streak: 3,
    recentPicks: ['GW13: Transfer in Palmer', 'GW12: Differential — Mbeumo', 'GW11: 4-3-3, captain Salah'],
  },
  {
    id: 'e2',
    name: 'Priya Nair',
    handle: '@priyawatches',
    score: 84,
    delta: -2,
    topMove: 'Differential: Semenyo <10%',
    byChallenge: { transfer: 26, differential: 33, strategy: 25 },
    hitRate: 71,
    streak: 1,
    recentPicks: ['GW13: Transfer out Sterling', 'GW12: 3-4-3, captain Haaland', 'GW11: Differential — Mbeumo'],
  },
  {
    id: 'e3',
    name: 'Marco Belli',
    handle: '@marcotactics',
    score: 81,
    delta: 6,
    topMove: 'Formation switch to 3-5-2',
    byChallenge: { transfer: 24, differential: 28, strategy: 29 },
    hitRate: 63,
    streak: 5,
    recentPicks: ['GW13: 3-5-2, captain Palmer', 'GW12: Transfer in Wood', 'GW11: Differential — Kudus'],
  },
  {
    id: 'e4',
    name: 'Sam Whitfield',
    handle: '@samw_fantasy',
    score: 76,
    delta: 0,
    topMove: 'Transfer in Watkins',
    byChallenge: { transfer: 27, differential: 22, strategy: 27 },
    hitRate: 59,
    streak: 0,
    recentPicks: ['GW13: Transfer in Watkins', 'GW12: Captain Salah', 'GW11: Differential — Gordon'],
  },
  {
    id: 'e5',
    name: 'Aisha Bello',
    handle: '@aishab',
    score: 72,
    delta: -5,
    topMove: 'Called Fernandes to blank',
    byChallenge: { transfer: 21, differential: 25, strategy: 26 },
    hitRate: 55,
    streak: 0,
    recentPicks: ['GW13: Blank call — Fernandes', 'GW12: 4-4-2, captain Isak', 'GW11: Transfer out Rashford'],
  },
];

const LEADERBOARDS: Record<LeaderboardKey, ExpertRow[]> = {
  oracle: BASE_EXPERTS,
  transfer: [...BASE_EXPERTS].sort((a, b) => b.byChallenge.transfer - a.byChallenge.transfer),
  differential: [...BASE_EXPERTS].sort((a, b) => b.byChallenge.differential - a.byChallenge.differential),
  strategy: [...BASE_EXPERTS].sort((a, b) => b.byChallenge.strategy - a.byChallenge.strategy),
};

export function getLeaderboard(key: LeaderboardKey): ExpertRow[] {
  return LEADERBOARDS[key];
}
