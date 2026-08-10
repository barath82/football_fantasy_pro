/**
 * Placeholder pre-set XI for the Challenges page (Transfer Out / Captain
 * pickers). No "connect your FPL team" flow exists yet — this is mock data
 * standing in for it, matching lovable_plan.md's "out of scope: real EPL
 * API integration / persistence" for this pass. Replace with the user's
 * actual team once FPL sign-in ships.
 */
export interface SquadPlayer {
  id: string;
  name: string;
  team: string;
  position: 'GKP' | 'DEF' | 'MID' | 'FWD';
}

export const PRESET_SQUAD: SquadPlayer[] = [
  { id: 'gkp-1', name: 'Raya', team: 'ARS', position: 'GKP' },
  { id: 'def-1', name: 'Trippier', team: 'NEW', position: 'DEF' },
  { id: 'def-2', name: 'Gabriel', team: 'ARS', position: 'DEF' },
  { id: 'def-3', name: 'Van Dijk', team: 'LIV', position: 'DEF' },
  { id: 'def-4', name: 'Estupiñán', team: 'BHA', position: 'DEF' },
  { id: 'mid-1', name: 'Salah', team: 'LIV', position: 'MID' },
  { id: 'mid-2', name: 'Palmer', team: 'CHE', position: 'MID' },
  { id: 'mid-3', name: 'Saka', team: 'ARS', position: 'MID' },
  { id: 'fwd-1', name: 'Haaland', team: 'MCI', position: 'FWD' },
  { id: 'fwd-2', name: 'Watkins', team: 'AVL', position: 'FWD' },
  { id: 'fwd-3', name: 'Isak', team: 'NEW', position: 'FWD' },
];
