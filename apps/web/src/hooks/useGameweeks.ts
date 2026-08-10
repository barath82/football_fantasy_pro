import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface GwSummary {
  id: number;
  fplId: number;
  name: string;
  deadlineTime: string;
  averageEntryScore: number | null;
  highestScore: number | null;
  transfersMade: number | null;
  finished: boolean;
  isCurrent: boolean;
  isNext: boolean;
  chipPlays: { name: string; count: number }[];
}

export interface TopPlayer {
  id: number;
  webName: string;
  code: number;
  team: string;
  position: string;
  totalPoints: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  bonus: number;
  minutes: number;
  saves: number;
}

export interface TransferMover {
  id: number;
  webName: string;
  code: number;
  team: string;
  position: string;
  value: number;
}

export interface GwDetail {
  summary: GwSummary;
  topScorers: TopPlayer[];
  topTransferredIn: TransferMover[];
  topTransferredOut: TransferMover[];
}

export function useGameweeks() {
  return useQuery<GwSummary[]>({
    queryKey: ['gameweeks'],
    queryFn: async () => {
      const { data } = await api.get('/gameweeks');
      return data;
    },
    staleTime: Infinity,
  });
}

/**
 * Resolves the live gameweek from the real gameweeks API (is_current flag).
 * A gameweek already marked `finished` is never trusted as "current" even if
 * is_current is set — that combination only happens with stale data (e.g. the
 * last synced season's finale, before the new season has been ingested), and
 * showing a finished gameweek as live would be actively misleading. Falls
 * back to the next unfinished gameweek, then to null — callers should render
 * a "gameweek 1 / preseason" placeholder in that case.
 */
export function useCurrentGameweek() {
  const query = useGameweeks();
  const gameweeks = query.data;

  const current =
    gameweeks?.find((gw) => gw.isCurrent && !gw.finished) ??
    gameweeks?.find((gw) => gw.isNext) ??
    null;

  return { ...query, current };
}

export function useGameweekDetail(gwFplId: number | null) {
  return useQuery<GwDetail>({
    queryKey: ['gameweek', gwFplId],
    queryFn: async () => {
      const { data } = await api.get(`/gameweeks/${gwFplId}`);
      return data;
    },
    enabled: gwFplId != null,
  });
}
