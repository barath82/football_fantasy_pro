import { ExpandableRow } from './ExpandableRow';
import { useFplLeagues, useFplLeagueStandings, type FplLeagueSummary } from '../hooks/useFplProfile';

// FPL returns 0 (not null) for entry_rank when a rank hasn't been computed
// yet for this league — e.g. just joined, before the next gameweek scores —
// so treat anything <= 0 as "not yet ranked" rather than a real rank.
function hasRank(rank: number | null): rank is number {
  return rank != null && rank > 0;
}

function PrivateLeagueRow({ league }: { league: FplLeagueSummary }) {
  const { data, isLoading } = useFplLeagueStandings(league.id);
  const standings = data?.standings ?? [];
  const top = standings.slice(0, 5);
  const me = standings.find((r) => r.isMe);
  const meInTop = top.some((r) => r.isMe);

  return (
    <ExpandableRow
      summary={
        <div className="flex items-baseline justify-between pr-2">
          <span className="text-sm" style={{ color: 'var(--pw-fg)' }}>
            {league.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            {hasRank(league.rank) ? `Rank ${league.rank.toLocaleString()}` : 'Unranked'}
          </span>
        </div>
      }
    >
      {isLoading && <p className="pl-1 text-xs">Loading standings…</p>}

      {!isLoading && standings.length === 0 && (
        <p className="pl-1 text-xs">Nothing computed yet for this league — check back after this gameweek.</p>
      )}

      {!isLoading && standings.length > 0 && (
        <div className="flex flex-col gap-0.5 pl-1">
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
        </div>
      )}
    </ExpandableRow>
  );
}

/**
 * All of the user's private classic leagues (global ones like "Overall" are
 * excluded — see useFplLeagues), one collapsed row each showing name + rank,
 * expandable into that league's standings — same interaction pattern as the
 * gameweek picks list on My Picks. Standings are only fetched per row (each
 * row owns its own query), not eagerly for every league up front.
 */
export function FplLeaguesSection({ enabled }: { enabled: boolean }) {
  const { data, isLoading } = useFplLeagues(enabled);
  if (!enabled || isLoading) return null;

  const privateLeagues = data?.leagues.filter((l) => !l.isGlobal) ?? [];

  if (privateLeagues.length === 0) {
    return (
      <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
        <p className="text-sm" style={{ color: 'var(--pw-fg)' }}>
          You're not part of any private leagues yet
        </p>
        <p className="mt-1.5 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          Join or create one in the FPL app with friends to see standings here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg px-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      {privateLeagues.map((league) => (
        <PrivateLeagueRow key={league.id} league={league} />
      ))}
    </div>
  );
}
