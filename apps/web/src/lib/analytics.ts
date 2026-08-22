import posthog from 'posthog-js';

/**
 * PostHog init. Autocapture (automatic click/interaction tracking) is
 * deliberately OFF — cost is driven by event volume, and autocapture can
 * easily 10x it with low-value noise. Only the explicit events below get
 * sent. No-ops cleanly if VITE_POSTHOG_KEY isn't set, so local dev never
 * needs a real account.
 *
 * capture_pageview is also OFF, on purpose: this is a React Router SPA —
 * navigating between pages never triggers a real browser page load, and
 * posthog-js's built-in History-API pageview detection isn't something to
 * blindly trust for "every page must be recorded". trackPageview() below is
 * called explicitly on every route change instead (see PredictorLayout).
 */
export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    person_profiles: 'identified_only', // no profile for anonymous visitors — cheaper, still gets aggregate/device analytics
    capture_pageview: false,
    autocapture: false,
  });
}

function isEnabled() {
  return !!import.meta.env.VITE_POSTHOG_KEY;
}

// Friendly name for the dashboard — lets you filter/breakdown $pageview by a
// readable page_name property instead of matching on raw paths. Falls back
// to the path itself for anything not listed (e.g. a future page nobody
// remembered to add here still shows up, just less prettily).
const PAGE_NAMES: Record<string, string> = {
  '/': 'Landing',
  '/challenges': 'Challenges',
  '/leaderboard': 'Leaderboard',
  '/scoring': 'Scoring',
  '/about': 'About',
  '/my-picks': 'My Picks',
  '/account': 'Account',
  '/signup': 'Signup',
  '/login': 'Login',
  '/forgot-password': 'Forgot Password',
  '/reset-password': 'Reset Password',
};

/** Fires a $pageview for the given path — call on every route change (see PredictorLayout). */
export function trackPageview(path: string) {
  if (!isEnabled()) return;
  posthog.capture('$pageview', {
    $current_url: window.location.origin + path,
    page_name: PAGE_NAMES[path] ?? path,
  });
}

/** Ties subsequent events to a real FantasyBrahma account instead of an anonymous session. */
export function identifyUser(user: { id: string; provider: string; createdAt?: string }) {
  if (!isEnabled()) return;
  posthog.identify(user.id, { provider: user.provider, created_at: user.createdAt });
}

/** Call on logout so the next visitor on this device doesn't inherit the previous user's identity. */
export function resetAnalyticsIdentity() {
  if (!isEnabled()) return;
  posthog.reset();
}

export type AnalyticsEvent =
  | { name: 'signup_completed'; props: { provider: 'google' | 'x' | 'email' } }
  | { name: 'login_completed'; props: { provider: 'google' | 'x' | 'email' } }
  | { name: 'logout'; props?: never }
  | {
      name: 'picks_submitted';
      props: { gameweek: number; is_edit: boolean; chip_picked: boolean; chip?: string; formation: string };
    }
  | { name: 'picks_submit_failed'; props: { reason: string } }
  | { name: 'leaderboard_tab_viewed'; props: { tab: string } };

export function trackEvent(event: AnalyticsEvent) {
  if (!isEnabled()) return;
  posthog.capture(event.name, event.props);
}
