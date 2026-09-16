import type { RankImpact } from '../hooks/useFplProfile';

function fmt(n: number | null): string {
  return n != null ? n.toLocaleString() : '-';
}

/** RANK IMPACT — how the selected gameweek moved the manager's overall rank. */
export function RankImpactCard({ gameweek, rankImpact }: { gameweek: number; rankImpact: RankImpact }) {
  const moved = rankImpact.rankMovement;
  const improved = moved != null && moved > 0;

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
        Rank impact
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Before GW{gameweek}
          </p>
          <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
            {fmt(rankImpact.previousOverallRank)}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            After GW{gameweek}
          </p>
          <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
            {fmt(rankImpact.overallRank)}
          </p>
        </div>
      </div>

      {moved != null && (
        <p className="mt-3 text-sm" style={{ color: improved ? 'var(--pw-up)' : 'var(--pw-negative)' }}>
          {improved ? '↑' : '↓'} {Math.abs(moved).toLocaleString()} places
        </p>
      )}

      {rankImpact.vsAverage != null && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          {rankImpact.vsAverage >= 0
            ? `You scored ${rankImpact.vsAverage} points above the FPL average.`
            : `You scored ${Math.abs(rankImpact.vsAverage)} points below the FPL average.`}
        </p>
      )}
    </div>
  );
}
