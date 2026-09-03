import { ArrowRight } from 'lucide-react';
import { useFplTransfers } from '../hooks/useFplProfile';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function PlayerRef({ player }: { player: { webName: string; team: string | null } | null }) {
  if (!player) return <span style={{ color: 'var(--pw-fg-muted)' }}>Unknown player</span>;
  return (
    <span style={{ color: 'var(--pw-fg)' }}>
      {player.webName}
      {player.team && <span style={{ color: 'var(--pw-fg-muted)' }}> · {player.team}</span>}
    </span>
  );
}

/** Full-season transfer history from the linked FPL team, newest first — one live call, nothing stored. */
export function FplTransferHistory({ enabled }: { enabled: boolean }) {
  const { data, isLoading } = useFplTransfers(enabled);
  if (!enabled || isLoading) return null;

  const transfers = data?.transfers ?? [];

  if (transfers.length === 0) {
    return (
      <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
        <p className="text-sm" style={{ color: 'var(--pw-fg)' }}>
          No transfers to show yet
        </p>
        <p className="mt-1.5 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          If you've made a transfer for an upcoming gameweek, FPL doesn't always expose it here right away —
          check back closer to the deadline.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg px-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      {transfers.map((t, i) => (
        <div
          key={`${t.event}-${t.time}-${i}`}
          className="flex items-center justify-between gap-3 py-3 text-xs"
          style={i < transfers.length - 1 ? { borderBottom: '1px solid var(--pw-border)' } : undefined}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="pw-display shrink-0" style={{ color: 'var(--pw-fg-muted)' }}>
              GW{t.event}
            </span>
            <PlayerRef player={t.playerOut} />
            <ArrowRight size={12} style={{ color: 'var(--pw-fg-muted)' }} className="shrink-0" />
            <PlayerRef player={t.playerIn} />
          </div>
          <span className="shrink-0" style={{ color: 'var(--pw-fg-muted)' }}>
            {formatDate(t.time)}
          </span>
        </div>
      ))}
    </div>
  );
}
