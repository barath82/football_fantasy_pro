interface Tab {
  key: string;
  label: string;
}

interface SegmentedTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function SegmentedTabs({ tabs, active, onChange }: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      className="flex gap-1 rounded-full p-1"
      style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className="pw-focus flex-1 rounded-full px-2.5 py-1.5 text-xs font-medium"
            style={{
              background: isActive ? 'var(--pw-surface-2)' : 'transparent',
              color: isActive ? 'var(--pw-fg)' : 'var(--pw-fg-muted)',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
