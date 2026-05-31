import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface TeamOption {
  id: number;
  fplId: number;
  name: string;
  shortName: string;
}

export function useTeams() {
  return useQuery<TeamOption[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data;
    },
    staleTime: Infinity,
  });
}
