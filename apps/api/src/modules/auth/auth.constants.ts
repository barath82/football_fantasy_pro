/**
 * "Stay logged in until you explicitly log out" (2026-08-20) — long-lived by
 * design rather than a short rolling session. Used for both the JWT's own
 * expiry and the cookie's maxAge so the two can't drift out of sync (they
 * were both hardcoded separately before this, at 30 days each).
 */
export const SESSION_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
