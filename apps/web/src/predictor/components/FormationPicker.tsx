const FORMATIONS = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];

interface FormationPickerProps {
  value: string;
  onChange: (formation: string) => void;
  disabled?: boolean;
}

/** Formation chip selector — defaults to 4-3-3 via the caller's initial state. */
export function FormationPicker({ value, onChange, disabled = false }: FormationPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FORMATIONS.map((f) => {
        const isActive = f === value;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            disabled={disabled}
            className="pw-focus rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: isActive ? 'var(--pw-accent)' : 'var(--pw-surface)',
              color: isActive ? 'var(--pw-accent-fg)' : 'var(--pw-fg-muted)',
              border: `1px solid ${isActive ? 'var(--pw-accent)' : 'var(--pw-border)'}`,
            }}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
