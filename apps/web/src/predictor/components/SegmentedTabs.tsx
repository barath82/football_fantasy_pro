import type { ComponentType, SVGProps } from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
}

interface SegmentedTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function SegmentedTabs({ tabs, active, onChange }: SegmentedTabsProps) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <div
        role="tablist"
        className="inline-flex min-w-full gap-1 rounded-full p-1"
        style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className="pw-focus flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
              style={{
                background: isActive ? 'var(--pw-surface-2)' : 'transparent',
                color: isActive ? 'var(--pw-fg)' : 'var(--pw-fg-muted)',
              }}
            >
              {Icon && <Icon size={14} style={{ color: isActive ? 'var(--pw-accent)' : 'inherit' }} />}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
