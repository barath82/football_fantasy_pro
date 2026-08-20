/**
 * One-time cleanup for the PWA/service worker setup removed 2026-08-20 (see
 * MEMORY.md — it caused two real bugs: OAuth redirects silently swallowed,
 * and deploys needing a double-refresh to show up). New visitors never get
 * a service worker at all now; this retires it for anyone who already has
 * one registered from before, so they don't get stuck on stale cached
 * content forever with nothing left to trigger an update. Safe to delete
 * this file (and its import in main.tsx) once confident nobody's left with
 * an old registration — cheap to leave in the meantime.
 */
export function unregisterStaleServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });

  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
}
