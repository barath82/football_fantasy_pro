import { useState } from 'react';
import { useTeams } from '../../hooks/useTeams';

interface TeamPickerProps {
  label: string;
  value: number | null;
  onChange: (teamId: number) => void;
  /** Keeps CS Guru's two picks from landing on the same team. */
  excludeTeamId?: number | null;
  disabled?: boolean;
}

/** Simple team select — only ~20 options, so a plain list beats a search box. */
export function TeamPicker({ label, value, onChange, excludeTeamId, disabled = false }: TeamPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: teams } = useTeams();

  const selected = teams?.find((t) => t.id === value) ?? null;
  const options = (teams ?? []).filter((t) => t.id !== excludeTeamId);

  return (
    <div className="relative" style={disabled ? { pointerEvents: 'none' } : undefined}>
      <label className="mb-1.5 block text-[0.63rem] font-medium" style={{ color: 'var(--pw-fg-muted)' }}>
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="pw-focus flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm"
        style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}
      >
        <span>{selected ? selected.name : 'Select a team'}</span>
      </button>

      {open && (
        <ul
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg"
          style={{ background: 'var(--pw-surface-2)', border: '1px solid var(--pw-border)' }}
        >
          {options.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                className="pw-focus flex w-full items-center justify-between px-3 py-2 text-left text-sm"
              >
                <span>{t.name}</span>
                <span style={{ color: 'var(--pw-fg-muted)' }}>{t.shortName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
