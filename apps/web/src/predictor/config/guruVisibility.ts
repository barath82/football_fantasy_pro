// Single source of truth for which Gurus are currently shown in the UI —
// imported by both Challenges (the input form) and My Picks (the read-only
// history view) so the two can't drift out of sync. Nothing underneath
// either flag was removed: state, hydration, submit payload, and backend
// fields are all still live. Flip a flag back to true to bring that Guru
// back everywhere it appears, with no other changes needed.
export const TRANSFER_GURU_VISIBLE = false;
export const CHIP_GURU_VISIBLE = false;
