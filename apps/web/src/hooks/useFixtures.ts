import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface FdrFixture {
  opponent: string;
  isHome: boolean;
  difficulty: number;
}

export interface TeamFdr {
  id: number;
  name: string;
  shortName: string;
  fixtures: Record<number, FdrFixture[]>;
}

export interface FdrData {
  gameweeks: number[];
  teams: TeamFdr[];
}

export function useFdr() {
  return useQuery<FdrData>({
    queryKey: ['fixtures', 'fdr'],
    queryFn: async () => {
      const { data } = await api.get('/fixtures/fdr');
      return data;
    },
    staleTime: Infinity,
  });
}
