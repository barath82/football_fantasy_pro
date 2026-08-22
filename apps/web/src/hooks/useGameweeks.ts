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
 *
 * Also doesn't blindly trust is_current/is_next once that gameweek's own
 * deadline has actually passed — the sync only flips those flags when it
 * re-runs, so between syncs (or right after a deadline) they can point at a
 * gameweek that's already closed. When that happens this steps forward to
 * the next gameweek whose deadline is still ahead, so the app shows the
 * gameweek that's actually open right now rather than a stale one.
 */
export function useCurrentGameweek() {
  const query = useGameweeks();
  const gameweeks = Array.isArray(query.data) ? query.data : undefined;
  const sorted = gameweeks ? [...gameweeks].sort((a, b) => a.fplId - b.fplId) : undefined;

  const isOpen = (gw: GwSummary) => !gw.finished && new Date(gw.deadlineTime).getTime() > Date.now();

  const flagged =
    sorted?.find((gw) => gw.isCurrent && !gw.finished) ?? sorted?.find((gw) => gw.isNext) ?? null;

  const current =
    (flagged && isOpen(flagged) ? flagged : sorted?.find(isOpen)) ?? flagged ?? null;

  return { ...query, current };
}

/**
 * The last gameweek with real results in — what the Leaderboard should
 * default to, since standings only mean something for a week that's
 * actually been played, not the one still open for picks. Prefers a
 * gameweek explicitly marked `finished`; if the sync hasn't flagged one yet
 * (e.g. right after a deadline, before results are marked in), falls back to
 * the gameweek just before the current open one, since its deadline has
 * already passed either way. Falls back to the current gameweek itself if
 * there's nothing earlier (e.g. still Gameweek 1).
 */
export function usePreviousCompletedGameweek() {
  const query = useGameweeks();
  const { current } = useCurrentGameweek();
  const gameweeks = Array.isArray(query.data) ? query.data : undefined;
  const sorted = gameweeks ? [...gameweeks].sort((a, b) => a.fplId - b.fplId) : undefined;

  const lastFinished = sorted ? [...sorted].reverse().find((gw) => gw.finished) : undefined;
  const beforeCurrent = current && sorted ? sorted.find((gw) => gw.fplId === current.fplId - 1) : undefined;

  const previousCompleted = lastFinished ?? beforeCurrent ?? current ?? null;

  return { ...query, previousCompleted };
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
