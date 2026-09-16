import type { DifferentialImpact } from '../hooks/useFplProfile';

/**
 * DIFFERENTIAL IMPACT — which ownership-related decisions mattered most
 * this week. Only ever shows real captured ownership for that gameweek
 * (the snapshot cron) — never today's ownership standing in for the past.
 */
export function DifferentialImpactCard({ differential }: { differential: DifferentialImpact }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
        Differential impact
      </p>

      {!differential.ownershipDataAvailable && (
        <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          Ownership data unavailable for this gameweek — historical ownership tracking started after this week
          finished, and we don't substitute today's ownership for the past.
        </p>
      )}

      {differential.ownershipDataAvailable && !differential.biggestBoost && !differential.biggestTemplateDamage && (
        <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          Nothing ownership-related stood out this gameweek.
        </p>
      )}

      {differential.ownershipDataAvailable && differential.biggestBoost && (
        <div className="mt-2">
          <p className="text-[0.65rem] font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
            Biggest differential boost
          </p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--pw-fg)' }}>
            {differential.biggestBoost.webName}
          </p>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            {differential.biggestBoost.ownershipPercent}% owned · {differential.biggestBoost.points} pts
          </p>
        </div>
      )}

      {differential.ownershipDataAvailable && differential.biggestTemplateDamage && (
        <div className="mt-3">
          <p className="text-[0.65rem] font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
            Biggest template damage
          </p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--pw-fg)' }}>
            {differential.biggestTemplateDamage.webName}
          </p>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            {differential.biggestTemplateDamage.ownershipPercent}% owned · Not owned · {differential.biggestTemplateDamage.points} pts
          </p>
        </div>
      )}
    </div>
  );
}
