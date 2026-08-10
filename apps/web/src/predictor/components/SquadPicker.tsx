import { useState } from 'react';
import { PRESET_SQUAD, type SquadPlayer } from '../mock/presetSquad';

interface SquadPickerProps {
  label: string;
  value: SquadPlayer | null;
  onChange: (player: SquadPlayer) => void;
  /** Exclude a player already picked elsewhere (e.g. the transfer-in pick). */
  exclude?: string | null;
}

/** Pick a player from the user's pre-set XI (Transfer Out, Captain) — no search needed. */
export function SquadPicker({ label, value, onChange, exclude }: SquadPickerProps) {
  const [open, setOpen] = useState(false);
  const options = PRESET_SQUAD.filter((p) => p.id !== exclude);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-[0.63rem] font-medium" style={{ color: 'var(--pw-fg-muted)' }}>
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="pw-focus flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm"
        style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}
      >
        {value ? (
          <span>
            {value.name} <span style={{ color: 'var(--pw-fg-muted)' }}>· {value.team}</span>
          </span>
        ) : (
          <span style={{ color: 'var(--pw-fg-muted)' }}>Select from your XI</span>
        )}
        <span style={{ color: 'var(--pw-fg-muted)' }}>{value?.position ?? ''}</span>
      </button>

      {open && (
        <ul
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg"
          style={{ background: 'var(--pw-surface-2)', border: '1px solid var(--pw-border)' }}
        >
          {options.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className="pw-focus flex w-full items-center justify-between px-3 py-2 text-left text-sm"
              >
                <span>
                  {p.name} <span style={{ color: 'var(--pw-fg-muted)' }}>· {p.team}</span>
                </span>
                <span style={{ color: 'var(--pw-fg-muted)' }}>{p.position}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
