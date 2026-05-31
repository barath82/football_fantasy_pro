import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface TeamDetail {
  team: {
    id: number;
    fplId: number;
    name: string;
    shortName: string;
    strengthOverallHome: number | null;
    strengthOverallAway: number | null;
  };
  topPlayers: {
    id: number;
    webName: string;
    firstName: string;
    secondName: string;
    position: string;
    totalPoints: number;
    goalsScored: number;
    assists: number;
    cleanSheets: number;
    nowCost: number | null;
    selectedByPercent: number | null;
    minutes: number;
    form: number | null;
    status: string;
  }[];
  posBreakdown: {
    position: string;
    count: number;
    totalPoints: number;
  }[];
}

export function useTeamDetail(id: number | null) {
  return useQuery<TeamDetail>({
    queryKey: ['team', id],
    queryFn: async () => {
      const { data } = await api.get(`/teams/${id}`);
      return data;
    },
    enabled: id != null,
  });
}
