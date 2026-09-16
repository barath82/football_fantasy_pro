import { useSeasonContext } from '../hooks/useFplProfile';

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/** Lightweight season-level context — three numbers, not a season dashboard. */
export function SeasonContextStrip({ enabled }: { enabled: boolean }) {
  const { data, isLoading } = useSeasonContext(enabled);
  if (!enabled || isLoading || !data || data.gameweeksCounted === 0) return null;

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
        Season so far ({data.gameweeksCounted} gameweeks)
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Transfer impact
          </p>
          <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
            {data.seasonTransferImpact != null ? signed(data.seasonTransferImpact) : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Captaincy efficiency
          </p>
          <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
            {data.seasonCaptaincyEfficiency != null ? `${data.seasonCaptaincyEfficiency}%` : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Lineup efficiency
          </p>
          <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
            {data.averageLineupEfficiency != null ? `${data.averageLineupEfficiency}%` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
