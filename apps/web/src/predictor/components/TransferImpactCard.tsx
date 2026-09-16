import type { TransferImpact, TransferPair } from '../hooks/useFplProfile';

const CHIP_LABELS: Record<string, string> = { wildcard: 'Wildcard', freehit: 'Free Hit' };

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function PairRow({ pair }: { pair: TransferPair }) {
  return (
    <div className="py-3" style={{ borderBottom: '1px solid var(--pw-border)' }}>
      <p className="text-sm" style={{ color: 'var(--pw-fg)' }}>
        {pair.playerOut?.webName ?? 'Unknown'} → {pair.playerIn?.webName ?? 'Unknown'}
      </p>

      <div className="mt-1.5 flex flex-col gap-0.5 text-xs">
        <div className="flex justify-between">
          <span style={{ color: 'var(--pw-fg-muted)' }}>{pair.playerIn?.webName ?? '-'}</span>
          <span style={{ color: 'var(--pw-fg)' }}>{pair.playerIn?.points ?? 0} pts</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--pw-fg-muted)' }}>{pair.playerOut?.webName ?? '-'}</span>
          <span style={{ color: 'var(--pw-fg)' }}>{pair.playerOut?.points ?? 0} pts</span>
        </div>
      </div>

      <div className="mt-1.5 flex justify-between text-xs">
        <span style={{ color: 'var(--pw-fg-muted)' }}>Player gain</span>
        <span style={{ color: pair.gain >= 0 ? 'var(--pw-up)' : 'var(--pw-negative)' }}>{signed(pair.gain)}</span>
      </div>

      {pair.threeGw && pair.threeGw.gameweeksCounted > 1 && (
        <div className="mt-2 rounded-md p-2" style={{ background: 'var(--pw-surface-2)' }}>
          <p className="text-[0.65rem] font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
            {pair.threeGw.gameweeksCounted}-GW impact
          </p>
          <div className="mt-1 flex justify-between text-xs">
            <span style={{ color: 'var(--pw-fg-muted)' }}>{pair.playerIn?.webName ?? '-'}</span>
            <span style={{ color: 'var(--pw-fg)' }}>{pair.threeGw.playerInPoints} pts</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--pw-fg-muted)' }}>{pair.playerOut?.webName ?? '-'}</span>
            <span style={{ color: 'var(--pw-fg)' }}>{pair.threeGw.playerOutPoints} pts</span>
          </div>
          <div className="mt-1 flex justify-between text-xs">
            <span style={{ color: 'var(--pw-fg-muted)' }}>Impact</span>
            <span style={{ color: pair.threeGw.impact >= 0 ? 'var(--pw-up)' : 'var(--pw-negative)' }}>
              {signed(pair.threeGw.impact)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** TRANSFER IMPACT — points gained/lost from transfers made in the selected gameweek. */
export function TransferImpactCard({ transferImpact }: { transferImpact: TransferImpact }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
        Transfer impact
      </p>

      {transferImpact.chip && (
        <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          {CHIP_LABELS[transferImpact.chip] ?? transferImpact.chip} played this gameweek — a full squad rebuild
          isn't broken down transfer-by-transfer.
        </p>
      )}

      {!transferImpact.chip && transferImpact.pairs.length === 0 && (
        <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          No transfers made this gameweek.
        </p>
      )}

      {!transferImpact.chip && transferImpact.pairs.length > 0 && (
        <>
          <div className="mt-2">
            {transferImpact.pairs.map((pair, i) => (
              <PairRow key={i} pair={pair} />
            ))}
          </div>

          <div className="mt-1 flex justify-between text-xs">
            <span style={{ color: 'var(--pw-fg-muted)' }}>Transfer cost</span>
            <span style={{ color: 'var(--pw-fg)' }}>{signed(-transferImpact.hitCost)}</span>
          </div>
          {transferImpact.combinedNetImpact != null && (
            <div className="mt-1 flex justify-between text-sm">
              <span className="pw-display" style={{ color: 'var(--pw-fg)' }}>
                Net impact
              </span>
              <span
                className="pw-display"
                style={{ color: transferImpact.combinedNetImpact >= 0 ? 'var(--pw-up)' : 'var(--pw-negative)' }}
              >
                {signed(transferImpact.combinedNetImpact)} pts
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
