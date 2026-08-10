import { useEffect, useState } from 'react';

interface CountdownProps {
  /** ISO timestamp (or Date) to count down to. */
  target: string | Date;
  /** Shown once the target has passed. */
  expiredLabel?: string;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/** Live-ticking "closes in ..." countdown to a gameweek deadline. */
export function Countdown({ target, expiredLabel = 'Picks locked' }: CountdownProps) {
  const targetMs = new Date(target).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(targetMs)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (Number.isNaN(targetMs)) return null;

  const diff = targetMs - now;
  const expired = diff <= 0;

  return (
    <p className="pw-eyebrow mt-1" style={expired ? { color: 'var(--pw-negative)' } : undefined}>
      {expired ? expiredLabel : `Closes in ${formatRemaining(diff)}`}
    </p>
  );
}
