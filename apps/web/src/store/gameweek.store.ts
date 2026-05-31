import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameweekStore {
  selectedGameweek: number | null;
  setSelectedGameweek: (gw: number | null) => void;
}

export const useGameweekStore = create<GameweekStore>()(
  persist(
    (set) => ({
      selectedGameweek: null,
      setSelectedGameweek: (gw) => set({ selectedGameweek: gw }),
    }),
    { name: 'fantasy-gameweek' },
  ),
);
