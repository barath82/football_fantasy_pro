import { useFplSnapshot } from '../hooks/useFplProfile';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        {label}
      </p>
      <p className="pw-display mt-0.5 text-base" style={{ color: 'var(--pw-fg)' }}>
        {value}
      </p>
    </div>
  );
}

function formatRank(rank: number | null): string {
  return rank != null ? rank.toLocaleString() : '-';
}

/** Season snapshot card for My Picks — rank, points, captain, chip usage. Renders nothing until data actually loads. */
export function FplSnapshotCard({ enabled }: { enabled: boolean }) {
  const { data, isLoading } = useFplSnapshot(enabled);
  if (!enabled || isLoading || !data) return null;

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <div className="flex items-baseline justify-between">
        <p className="pw-display text-sm" style={{ color: 'var(--pw-fg)' }}>
          {data.teamName}
        </p>
        {data.gameweek != null && (
          <span className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            GW{data.gameweek}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatTile label="Overall rank" value={formatRank(data.overallRank)} />
        <StatTile label="Total points" value={data.overallPoints != null ? String(data.overallPoints) : '-'} />
        <StatTile label="GW points" value={data.gameweekPoints != null ? String(data.gameweekPoints) : '-'} />
      </div>

      {data.captain && (
        <p className="mt-3 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          Captain:{' '}
          <span style={{ color: 'var(--pw-fg)' }}>
            {data.captain.webName}
            {data.captain.team ? ` · ${data.captain.team}` : ''}
          </span>
        </p>
      )}

      {data.chipsUsed.length > 0 && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          Chips used:{' '}
          <span style={{ color: 'var(--pw-fg)' }}>
            {data.chipsUsed.map((c) => `${c.label} (GW${c.event})`).join(', ')}
          </span>
        </p>
      )}
    </div>
  );
}
