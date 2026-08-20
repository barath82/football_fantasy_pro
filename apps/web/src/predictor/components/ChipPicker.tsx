const CHIPS: { value: string; label: string }[] = [
  { value: 'wildcard', label: 'Wildcard' },
  { value: 'free_hit', label: 'Free Hit' },
  { value: 'bench_boost', label: 'Bench Boost' },
  { value: 'triple_captain', label: 'Triple Captain' },
];

interface ChipPickerProps {
  value: string | null;
  /** Optional — clicking the already-selected chip again clears it (null). */
  onChange: (chip: string | null) => void;
  disabled?: boolean;
}

/** Which chip is the smart play this gameweek — same segmented-pill pattern as FormationPicker. Optional, and tap-to-toggle. */
export function ChipPicker({ value, onChange, disabled = false }: ChipPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => {
        const isActive = chip.value === value;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onChange(isActive ? null : chip.value)}
            disabled={disabled}
            className="pw-focus rounded-full px-3 py-1.5 text-xs font-medium disabled:pointer-events-none"
            style={{
              background: isActive ? 'var(--pw-accent)' : 'var(--pw-surface)',
              color: isActive ? 'var(--pw-accent-fg)' : 'var(--pw-fg-muted)',
              border: `1px solid ${isActive ? 'var(--pw-accent)' : 'var(--pw-border)'}`,
            }}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
