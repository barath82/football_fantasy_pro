import type { BestDecision, BiggestMiss } from '../hooks/useFplProfile';

/** BEST DECISION / BIGGEST MISS — the single most meaningful positive and negative decision this gameweek. */
export function DecisionHighlights({ best, miss }: { best: BestDecision | null; miss: BiggestMiss | null }) {
  if (!best && !miss) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {best && (
        <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-up)' }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-up)' }}>
            Best decision
          </p>
          <p className="pw-display mt-1 text-base" style={{ color: 'var(--pw-fg)' }}>
            {best.headline}
          </p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
            {best.detail}
          </p>
        </div>
      )}

      {miss && (
        <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
            Biggest miss
          </p>
          <p className="pw-display mt-1 text-base" style={{ color: 'var(--pw-fg)' }}>
            {miss.headline}
          </p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
            {miss.detail}
          </p>
        </div>
      )}
    </div>
  );
}
