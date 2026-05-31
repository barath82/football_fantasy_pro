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
