import { useDeadline } from '../hooks/useDeadline';

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

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/** Live-ticking "closes in ..." countdown to a gameweek deadline. */
export function Countdown({ target, expiredLabel = 'Picks locked' }: CountdownProps) {
  const { msRemaining, expired } = useDeadline(target);

  if (msRemaining === null) return null;

  return (
    <p className="pw-eyebrow mt-[8.8px]" style={expired ? { color: 'var(--pw-negative)' } : undefined}>
      {expired ? expiredLabel : `Closes in ${formatRemaining(msRemaining)}`}
    </p>
  );
}
