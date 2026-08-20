import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface ExpandableRowProps {
  /** Always-visible row content (rank, name, score, delta). */
  summary: ReactNode;
  /** Revealed on tap — deeper analytics. */
  children: ReactNode;
  defaultOpen?: boolean;
  /**
   * An optional interactive element (e.g. a Link) rendered next to the
   * toggle button rather than inside it — nesting a link/button inside the
   * toggle `<button>` would be invalid HTML and break keyboard/screen-reader
   * behavior.
   */
  action?: ReactNode;
}

/** Tap-to-expand row that hides deep analytics behind a chevron reveal. */
export function ExpandableRow({ summary, children, defaultOpen = false, action }: ExpandableRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid var(--pw-border)' }}>
      <div className="flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="pw-focus flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex-1">{summary}</div>
          <ChevronDown
            size={18}
            style={{
              color: 'var(--pw-fg-muted)',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 150ms ease',
              flexShrink: 0,
            }}
          />
        </button>
        {action}
      </div>
      {open && (
        <div className="pb-5 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          {children}
        </div>
      )}
    </div>
  );
}
