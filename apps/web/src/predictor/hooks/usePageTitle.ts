import { useEffect } from 'react';

/**
 * Sets the browser tab title for a predictor page. This is a plain SPA
 * (react-router, not TanStack Start), so there's no route-level head
 * management — this is the lightweight equivalent for just the title.
 * Per-route OG/twitter meta tags are not wired up (low value until this is
 * actually deployed and shared), the static defaults in index.html cover it.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
