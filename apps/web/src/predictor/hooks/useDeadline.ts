import { useEffect, useState } from 'react';

interface DeadlineState {
  msRemaining: number | null;
  /** True once `target` has passed. False (not true) when there's no target yet. */
  expired: boolean;
}

/**
 * Live-ticking countdown state shared by the eyebrow <Countdown/> display and
 * anything that needs to gate behavior on the deadline (e.g. locking the
 * Challenges page the instant it passes, no page refresh required).
 */
export function useDeadline(target: string | Date | null | undefined): DeadlineState {
  const targetMs = target ? new Date(target).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(targetMs)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (Number.isNaN(targetMs)) return { msRemaining: null, expired: false };

  const msRemaining = targetMs - now;
  return { msRemaining, expired: msRemaining <= 0 };
}
