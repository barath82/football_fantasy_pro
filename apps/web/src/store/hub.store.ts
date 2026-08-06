import { create } from 'zustand';

interface HubStore {
  selectedGW: number;
  setSelectedGW: (gw: number) => void;
}

export const useHubStore = create<HubStore>(set => ({
  selectedGW: 1,
  setSelectedGW: gw => set({ selectedGW: gw }),
}));
