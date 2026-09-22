import type { LineupEfficiency } from '../hooks/useFplProfile';

/** LINEUP EFFICIENCY — actual starting XI vs the best legal XI available from the same 15-player squad. */
export function LineupEfficiencyCard({ lineup }: { lineup: LineupEfficiency }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
        Lineup efficiency
      </p>

      {lineup.chip === 'bboost' ? (
        <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          Bench Boost played — your whole 15-player squad's points counted, so there's no bench to compare against.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
                Actual XI
              </p>
              <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
                {lineup.actualPoints} pts
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
                Best possible XI
              </p>
              <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
                {lineup.bestPossiblePoints} pts
              </p>
            </div>
          </div>

          {lineup.efficiency != null && (
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
                Efficiency
              </span>
              <span className="pw-display text-lg" style={{ color: 'var(--pw-fg)' }}>
                {lineup.efficiency}%
              </span>
            </div>
          )}

          {lineup.efficiency != null && (
            <p className="mt-0.5 text-[0.63rem]" style={{ color: 'var(--pw-fg-muted)' }}>
              {lineup.actualPoints} / {lineup.bestPossiblePoints} = {lineup.efficiency}%
            </p>
          )}

          {lineup.biggestMiss && (
            <div className="mt-3 rounded-md p-2.5" style={{ background: 'var(--pw-surface-2)' }}>
              <p className="text-[0.63rem] font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
                Biggest lineup miss
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg)' }}>
                Benched {lineup.biggestMiss.benched.webName} — {lineup.biggestMiss.benched.points} pts
              </p>
              <p className="text-xs" style={{ color: 'var(--pw-fg)' }}>
                Started {lineup.biggestMiss.startedInstead.webName} — {lineup.biggestMiss.startedInstead.points} pts
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
