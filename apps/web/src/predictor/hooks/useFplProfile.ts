import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface FplSnapshot {
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

export interface FplLeagueSummary {
  id: number;
  name: string;
  isGlobal: boolean;
  rank: number | null;
}

export interface FplLeagueStandingsRow {
  rank: number;
  entryId: number;
  teamName: string;
  managerName: string;
  totalPoints: number;
  eventPoints: number;
  isMe: boolean;
}

export interface FplTransfer {
  event: number;
  time: string;
  playerIn: { webName: string; team: string | null } | null;
  playerOut: { webName: string; team: string | null } | null;
}

export interface RankImpact {
  points: number;
  average: number | null;
  vsAverage: number | null;
  overallRank: number;
  previousOverallRank: number | null;
  rankMovement: number | null;
  topPercent: number | null;
}

export interface TransferPair {
  playerIn: { webName: string; team: string | null; points: number } | null;
  playerOut: { webName: string; team: string | null; points: number } | null;
  gain: number;
  threeGw: { playerInPoints: number; playerOutPoints: number; impact: number; gameweeksCounted: number } | null;
}

export interface TransferImpact {
  chip: 'wildcard' | 'freehit' | null;
  hitCost: number;
  pairs: TransferPair[];
  combinedNetImpact: number | null;
}

export interface PlayerRef {
  webName: string;
  team: string | null;
  points: number;
}

export interface Captaincy {
  captain: (PlayerRef & { multiplier: number }) | null;
  bestAvailable: PlayerRef | null;
  efficiency: number | null;
  missedPoints: number | null;
  isTripleCaptain: boolean;
  captainDidNotPlay: boolean;
}

export interface LineupEfficiency {
  chip: 'bboost' | null;
  actualPoints: number | null;
  bestPossiblePoints: number | null;
  efficiency: number | null;
  missedPoints: number | null;
  biggestMiss: { benched: PlayerRef; startedInstead: PlayerRef } | null;
}

export interface DifferentialPlayer extends PlayerRef {
  ownershipPercent: number;
}

export interface DifferentialImpact {
  ownershipDataAvailable: boolean;
  biggestBoost: DifferentialPlayer | null;
  biggestTemplateDamage: DifferentialPlayer | null;
}

export interface BestDecision {
  type: 'transfer' | 'captaincy' | 'differential';
  headline: string;
  detail: string;
}

export interface BiggestMiss {
  type: 'lineup' | 'captaincy' | 'transfer';
  headline: string;
  detail: string;
}

export interface GameweekReview {
  gameweek: number;
  rankImpact: RankImpact;
  transferImpact: TransferImpact;
  captaincy: Captaincy;
  lineupEfficiency: LineupEfficiency;
  differentialImpact: DifferentialImpact;
  bestDecision: BestDecision | null;
  biggestMiss: BiggestMiss | null;
}

/**
 * Reads our own backend only, which itself live-fetches FPL's public API on
 * every call — no snapshot stored anywhere. Same react-query staleTime
 * pattern used everywhere else in the app for the client-side cache layer.
 */
export function useFplSnapshot(enabled: boolean) {
  return useQuery<FplSnapshot>({
    queryKey: ['fpl-profile', 'snapshot'],
    queryFn: async () => {
      const { data } = await api.get('/me/fpl/snapshot');
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useFplLeagues(enabled: boolean) {
  return useQuery<{ managerId: number; leagues: FplLeagueSummary[] }>({
    queryKey: ['fpl-profile', 'leagues'],
    queryFn: async () => {
      const { data } = await api.get('/me/fpl/leagues');
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useFplLeagueStandings(leagueId: number | null) {
  return useQuery<{ leagueId: number; leagueName: string | null; standings: FplLeagueStandingsRow[] }>({
    queryKey: ['fpl-profile', 'standings', leagueId],
    queryFn: async () => {
      const { data } = await api.get(`/me/fpl/leagues/${leagueId}/standings`);
      return data;
    },
    enabled: leagueId != null,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useFplTransfers(enabled: boolean) {
  return useQuery<{ managerId: number; transfers: FplTransfer[] }>({
    queryKey: ['fpl-profile', 'transfers'],
    queryFn: async () => {
      const { data } = await api.get('/me/fpl/transfers');
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export interface SeasonContext {
  gameweeksCounted: number;
  seasonTransferImpact: number | null;
  seasonCaptaincyEfficiency: number | null;
  averageLineupEfficiency: number | null;
}

export function useSeasonContext(enabled: boolean) {
  return useQuery<SeasonContext>({
    queryKey: ['fpl-profile', 'season'],
    queryFn: async () => {
      const { data } = await api.get('/me/fpl/season');
      return data;
    },
    enabled,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}

/** Personal Gameweek Review — omit `gameweek` for the latest completed one. */
export function useGameweekReview(enabled: boolean, gameweek?: number) {
  return useQuery<GameweekReview>({
    queryKey: ['fpl-profile', 'review', gameweek ?? 'latest'],
    queryFn: async () => {
      const { data } = await api.get('/me/fpl/review', { params: gameweek ? { gameweek } : undefined });
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
