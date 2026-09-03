import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { usePlayers, type PlayerRow } from '../../hooks/usePlayers';
import { useTeams } from '../../hooks/useTeams';

// Same position id convention already used by the stats dashboard's player filters.
const POSITIONS = [
  { label: 'GKP', id: 1 },
  { label: 'DEF', id: 2 },
  { label: 'MID', id: 3 },
  { label: 'FWD', id: 4 },
];

interface PlayerPickerProps {
  label: string;
  value: PlayerRow | null;
  onChange: (player: PlayerRow) => void;
  /** Ownership filters — used by the Differential Guru picks. */
  minOwnership?: number;
  maxOwnership?: number;
  placeholder?: string;
  /** Renders non-interactive and dimmed — e.g. Transfer Guru on Gameweek 1. */
  disabled?: boolean;
}

/** Searchable player select, backed by the real /players API (name + live ownership %), with an optional team/position filter. */
export function PlayerPicker({
  label,
  value,
  onChange,
  minOwnership,
  maxOwnership,
  placeholder = 'Search players',
  disabled = false,
}: PlayerPickerProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [positionId, setPositionId] = useState<number | undefined>(undefined);
  const [teamId, setTeamId] = useState<number | undefined>(undefined);

  const { data: teams } = useTeams();
  const hasActiveFilters = positionId != null || teamId != null;

  // Debounce the network search by 200ms — the input itself stays instant.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  const searchActive = debouncedQuery.trim().length >= 2;

  const { data, isFetching } = usePlayers({
    search: searchActive ? debouncedQuery.trim() : undefined,
    minOwnership,
    maxOwnership,
    positionId,
    teamId,
    sortBy: 'totalPoints',
    sortOrder: 'DESC',
    pageSize: 8,
  });

  // Browsable without typing a name — picking a position/team filter alone
  // is enough to show results, for anyone who doesn't remember the name or
  // just wants to see who's under a filter and tap to pick.
  const canBrowse = searchActive || hasActiveFilters;
  const results = canBrowse ? (data?.data ?? []) : [];

  return (
    <div className="relative" style={disabled ? { pointerEvents: 'none' } : undefined}>
      <label className="mb-1.5 block text-[0.63rem] font-medium" style={{ color: 'var(--pw-fg-muted)' }}>
        {label}
      </label>

      {value && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="pw-focus flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}
        >
          <span>
            {value.webName} <span style={{ color: 'var(--pw-fg-muted)' }}>· {value.team.shortName}</span>
          </span>
          <span style={{ color: 'var(--pw-fg-muted)' }}>
            {value.selectedByPercent != null ? `${value.selectedByPercent}%` : '-'}
          </span>
        </button>
      ) : (
        <div className="relative flex items-center">
          <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--pw-fg-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="pw-focus w-full rounded-lg py-2 pr-9 pl-9 text-sm"
            style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
          />
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setShowFilters((s) => !s);
            }}
            disabled={disabled}
            aria-label="Filter by position or team"
            aria-pressed={showFilters}
            className="pw-focus flex items-center justify-center"
            style={{ position: 'absolute', right: 8, color: hasActiveFilters ? 'var(--pw-accent)' : 'var(--pw-fg-muted)' }}
          >
            <SlidersHorizontal size={15} />
            {hasActiveFilters && (
              <span
                style={{
                  position: 'absolute',
                  top: -1,
                  right: -1,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--pw-accent)',
                }}
              />
            )}
          </button>
        </div>
      )}

      {open && (showFilters || canBrowse) && (
        <div
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg"
          style={{ background: 'var(--pw-surface-2)', border: '1px solid var(--pw-border)' }}
        >
          {showFilters && (
            <div className="flex flex-col gap-2.5 p-3" style={{ borderBottom: '1px solid var(--pw-border)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[0.63rem] font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
                  Filter
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setPositionId(undefined);
                      setTeamId(undefined);
                    }}
                    className="pw-focus text-xs"
                    style={{ color: 'var(--pw-accent)' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {POSITIONS.map((pos) => {
                  const isActive = positionId === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPositionId(isActive ? undefined : pos.id)}
                      className="pw-focus rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        background: isActive ? 'var(--pw-accent)' : 'var(--pw-surface)',
                        color: isActive ? 'var(--pw-accent-fg)' : 'var(--pw-fg-muted)',
                        border: `1px solid ${isActive ? 'var(--pw-accent)' : 'var(--pw-border)'}`,
                      }}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {teams?.map((team) => {
                  const isActive = teamId === team.id;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setTeamId(isActive ? undefined : team.id)}
                      className="pw-focus rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        background: isActive ? 'var(--pw-accent)' : 'var(--pw-surface)',
                        color: isActive ? 'var(--pw-accent-fg)' : 'var(--pw-fg-muted)',
                        border: `1px solid ${isActive ? 'var(--pw-accent)' : 'var(--pw-border)'}`,
                      }}
                    >
                      {team.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {canBrowse && (
            <ul>
              {isFetching && (
                <li className="px-3 py-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
                  Searching…
                </li>
              )}
              {!isFetching && results.length === 0 && (
                <li className="px-3 py-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
                  No players match
                </li>
              )}
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(p);
                      setQuery('');
                      setOpen(false);
                      setShowFilters(false);
                    }}
                    className="pw-focus flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                  >
                    <span>
                      {p.webName} <span style={{ color: 'var(--pw-fg-muted)' }}>· {p.team.shortName}</span>
                    </span>
                    <span style={{ color: 'var(--pw-fg-muted)' }}>
                      {p.selectedByPercent != null ? `${p.selectedByPercent}%` : '-'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showFilters && !canBrowse && (
            <p className="px-3 py-2 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
              Pick a position or team, or type a name to search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
