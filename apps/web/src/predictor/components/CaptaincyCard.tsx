import type { Captaincy } from '../hooks/useFplProfile';

/** CAPTAINCY — how the manager's captain pick compared to the best option actually in their XI. */
export function CaptaincyCard({ captaincy }: { captaincy: Captaincy }) {
  if (!captaincy.captain) return null;

  const sameBest = captaincy.bestAvailable?.webName === captaincy.captain.webName;

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
        Captaincy
      </p>

      {captaincy.isTripleCaptain && (
        <p className="mt-1 text-xs" style={{ color: 'var(--pw-accent)' }}>
          Triple Captain played
        </p>
      )}
      {captaincy.captainDidNotPlay && (
        <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          Your vice-captain took the armband — original captain didn't play.
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Your captain
          </p>
          <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
            {captaincy.captain.webName}
          </p>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            {captaincy.captain.points} pts
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Best available
          </p>
          <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
            {sameBest ? 'Same player' : captaincy.bestAvailable?.webName ?? '-'}
          </p>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            {captaincy.bestAvailable?.points ?? 0} pts
          </p>
        </div>
      </div>

      {captaincy.efficiency != null && (
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Captaincy efficiency
          </span>
          <span className="pw-display text-lg" style={{ color: 'var(--pw-fg)' }}>
            {captaincy.efficiency}%
          </span>
        </div>
      )}

      {captaincy.efficiency != null && captaincy.bestAvailable && (
        <p className="mt-0.5 text-[0.63rem]" style={{ color: 'var(--pw-fg-muted)' }}>
          {captaincy.captain.points} / {captaincy.bestAvailable.points} = {captaincy.efficiency}%
        </p>
      )}

      {!!captaincy.missedPoints && (
        <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          Potential missed: {captaincy.missedPoints} pts
        </p>
      )}
    </div>
  );
}
