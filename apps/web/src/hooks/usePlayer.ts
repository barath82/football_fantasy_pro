import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PlayerRow } from './usePlayers';

export interface GwHistory {
  gameweek: number;
  gameweekName: string;
  opponent: string;
  wasHome: boolean;
  totalPoints: number;
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
  influence: string | null;
  creativity: string | null;
  threat: string | null;
  ictIndex: string | null;
  price: number;
  selected: number;
  transfersIn: number;
  transfersOut: number;
}

export interface PlayerDetail {
  player: PlayerRow;
  history: GwHistory[];
}

export function usePlayer(id: number) {
  return useQuery<PlayerDetail>({
    queryKey: ['player', id],
    queryFn: async () => {
      const { data } = await api.get(`/players/${id}`);
      return data;
    },
    enabled: id > 0,
  });
}
