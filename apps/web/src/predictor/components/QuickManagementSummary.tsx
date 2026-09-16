import type { GameweekReview } from '../hooks/useFplProfile';

export type SummaryTileKey = 'transfers' | 'captaincy' | 'lineup' | 'differentials';

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function tileValue(review: GameweekReview, key: SummaryTileKey): string {
  switch (key) {
    case 'transfers':
      return review.transferImpact.chip
        ? '—'
        : review.transferImpact.combinedNetImpact != null
          ? signed(review.transferImpact.combinedNetImpact)
          : '—';
    case 'captaincy':
      return review.captaincy.efficiency != null ? `${review.captaincy.efficiency}%` : '—';
    case 'lineup':
      return review.lineupEfficiency.efficiency != null ? `${review.lineupEfficiency.efficiency}%` : '—';
    case 'differentials':
      return review.differentialImpact.biggestBoost ? signed(review.differentialImpact.biggestBoost.points) : '—';
  }
}

const LABELS: Record<SummaryTileKey, string> = {
  transfers: 'Transfers',
  captaincy: 'Captaincy',
  lineup: 'Lineup',
  differentials: 'Differentials',
};

/**
 * "Summary first, details second" — four compact tiles, tap one to reveal
 * the full detailed card for that dimension below (see GameweekReviewSection).
 */
export function QuickManagementSummary({
  review,
  expanded,
  onToggle,
}: {
  review: GameweekReview;
  expanded: SummaryTileKey | null;
  onToggle: (key: SummaryTileKey) => void;
}) {
  const keys: SummaryTileKey[] = ['transfers', 'captaincy', 'lineup', 'differentials'];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onToggle(key)}
          className="pw-focus rounded-lg p-3 text-left"
          style={{
            background: expanded === key ? 'var(--pw-accent)' : 'var(--pw-surface)',
            border: `1px solid ${expanded === key ? 'var(--pw-accent)' : 'var(--pw-border)'}`,
          }}
        >
          <p className="text-[0.65rem] font-medium uppercase tracking-wide" style={{ color: expanded === key ? 'var(--pw-accent-fg)' : 'var(--pw-fg-muted)' }}>
            {LABELS[key]}
          </p>
          <p className="pw-display mt-0.5 text-lg" style={{ color: expanded === key ? 'var(--pw-accent-fg)' : 'var(--pw-fg)' }}>
            {tileValue(review, key)}
          </p>
        </button>
      ))}
    </div>
  );
}
