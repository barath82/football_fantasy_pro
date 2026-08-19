import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { usePlayers, type PlayerRow } from '../../hooks/usePlayers';

interface PlayerPickerProps {
  label: string;
  value: PlayerRow | null;
  onChange: (player: PlayerRow) => void;
  /** Ownership filters — used by the Differential Guru picks. */
  minOwnership?: number;
  maxOwnership?: number;
  placeholder?: string;
}

/** Searchable player select, backed by the real /players API (name + live ownership %). */
export function PlayerPicker({ label, value, onChange, minOwnership, maxOwnership, placeholder = 'Search players' }: PlayerPickerProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);

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
    sortBy: 'totalPoints',
    sortOrder: 'DESC',
    pageSize: 8,
  });

  const results = searchActive ? (data?.data ?? []) : [];

  return (
    <div className="relative">
      <label className="mb-1.5 block text-[0.63rem] font-medium" style={{ color: 'var(--pw-fg-muted)' }}>
        {label}
      </label>

      {value && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pw-focus flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}
        >
          <span>
            {value.webName} <span style={{ color: 'var(--pw-fg-muted)' }}>· {value.team.shortName}</span>
          </span>
          <span style={{ color: 'var(--pw-fg-muted)' }}>
            {value.selectedByPercent != null ? `${value.selectedByPercent}%` : '—'}
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
            className="pw-focus w-full rounded-lg py-2 pl-9 pr-3 text-sm"
            style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
          />
        </div>
      )}

      {open && searchActive && (
        <ul
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg"
          style={{ background: 'var(--pw-surface-2)', border: '1px solid var(--pw-border)' }}
        >
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
                }}
                className="pw-focus flex w-full items-center justify-between px-3 py-2 text-left text-sm"
              >
                <span>
                  {p.webName} <span style={{ color: 'var(--pw-fg-muted)' }}>· {p.team.shortName}</span>
                </span>
                <span style={{ color: 'var(--pw-fg-muted)' }}>
                  {p.selectedByPercent != null ? `${p.selectedByPercent}%` : '—'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
