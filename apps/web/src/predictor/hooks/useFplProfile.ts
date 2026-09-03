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
