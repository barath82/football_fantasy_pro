import { useFplLeagues, useFplLeagueStandings } from '../hooks/useFplProfile';

// FPL returns 0 (not null) for entry_rank when a rank hasn't been computed
// yet for this league — e.g. just joined, before the next gameweek scores —
// so treat anything <= 0 as "not yet ranked" rather than a real rank.
function hasRank(rank: number | null): rank is number {
  return rank != null && rank > 0;
}

function NoPrivateLeagueCard() {
  return (
    <div className="mt-4 rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <p className="text-sm" style={{ color: 'var(--pw-fg)' }}>
        You're not part of any private leagues yet
      </p>
      <p className="mt-1.5 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        Join or create one in the FPL app with friends to see standings here.
      </p>
    </div>
  );
}

/**
 * Mini-league standings card for My Picks — shows the user's first joined
 * private league (global leagues like "Overall" are never shown here, only
 * used to detect their absence), top 5 rows, with the user's own row
 * surfaced even if it falls outside the top 5. If they're not in any
 * private league — or the only one they're in has nothing computed yet
 * (empty standings, no rank — e.g. just created) — shows the same "join a
 * league" prompt rather than a mostly-blank card either way.
 */
export function FplLeagueCard({ enabled }: { enabled: boolean }) {
  const { data: leaguesData, isLoading: leaguesLoading } = useFplLeagues(enabled);
  const primaryLeague = leaguesData?.leagues.find((l) => !l.isGlobal) ?? null;
  const { data: standingsData, isLoading: standingsLoading } = useFplLeagueStandings(primaryLeague?.id ?? null);

  if (!enabled || leaguesLoading || !leaguesData) return null;
  if (!primaryLeague) return <NoPrivateLeagueCard />;
  if (standingsLoading) return null; // avoid a flash of "no private leagues" before we know if this one has data

  const standings = standingsData?.standings ?? [];
  if (standings.length === 0 && !hasRank(primaryLeague.rank)) return <NoPrivateLeagueCard />;

  const top = standings.slice(0, 5);
  const me = standings.find((r) => r.isMe);
  const meInTop = top.some((r) => r.isMe);

  return (
    <div className="mt-4 rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <p className="pw-display text-sm" style={{ color: 'var(--pw-fg)' }}>
        {primaryLeague.name}
      </p>

      <div className="mt-2">
        {top.map((row) => (
          <div
            key={row.entryId}
            className="flex items-center justify-between py-1 text-xs"
            style={{ color: row.isMe ? 'var(--pw-fg)' : 'var(--pw-fg-muted)', fontWeight: row.isMe ? 600 : 400 }}
          >
            <span>
              {row.rank}. {row.managerName}
            </span>
            <span className="pw-display">{row.totalPoints} pts</span>
          </div>
        ))}

        {!meInTop && me && (
          <div className="flex items-center justify-between py-1 text-xs" style={{ color: 'var(--pw-fg)', fontWeight: 600 }}>
            <span>
              {me.rank}. {me.managerName}
            </span>
            <span className="pw-display">{me.totalPoints} pts</span>
          </div>
        )}

        {!meInTop && !me && (
          <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            {hasRank(primaryLeague.rank)
              ? `You: rank ${primaryLeague.rank.toLocaleString()}`
              : "You haven't been ranked in this league yet."}
          </p>
        )}
      </div>
    </div>
  );
}
