/**
 * Carries in-progress Challenges picks across the submit → login → resume
 * redirect. Only ids are stored (not full player objects) — small, and the
 * page re-fetches full details for the real players on hydration anyway.
 */
export interface PickDraft {
  gameweekFplId: number;
  transferInPlayerId: number;
  transferOutPlayerId: number;
  differentialSucceedPlayerId: number;
  differentialBlankPlayerId: number;
  formation: string;
  captainPlayerId: number;
}

const KEY = 'pw_pending_picks';

export function saveDraft(draft: PickDraft) {
  localStorage.setItem(KEY, JSON.stringify(draft));
}

export function readDraft(): PickDraft | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PickDraft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(KEY);
}
