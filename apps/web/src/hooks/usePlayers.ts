import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface PlayerRow {
  id: number;
  fplId: number;
  webName: string;
  firstName: string;
  secondName: string;
  status: string;
  news: string | null;
  code: number;
  team: { id: number; name: string; shortName: string };
  position: { id: number; short: string };
  nowCost: number | null;
  costChangeStart?: number | null;
  selectedByPercent: number | null;
  totalPoints: number;
  pointsPerGame?: number | null;
  form?: number | null;
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  bonus: number;
  bps: number;
  ictIndex?: number | null;
}

export interface PlayersResponse {
  data: PlayerRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PlayerFilters {
  gameweek?: number;
  teamId?: number;
  positionId?: number;
  minOwnership?: number;
  maxOwnership?: number;
  minPrice?: number;
  maxPrice?: number;
  minPoints?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

export function usePlayers(filters: PlayerFilters) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  );

  return useQuery<PlayersResponse>({
    queryKey: ['players', params],
    queryFn: async () => {
      const { data } = await api.get('/players', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}
