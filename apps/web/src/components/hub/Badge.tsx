import { CONTENT_TYPE_CONFIG, SOURCE_TYPE_CONFIG } from '../../config/contentTypes';
import type { ContentType, SourceType } from '../../config/contentTypes';

interface ContentTypeBadgeProps {
  type: ContentType;
  size?: 'sm' | 'xs';
}

export function ContentTypeBadge({ type, size = 'sm' }: ContentTypeBadgeProps) {
  const cfg = CONTENT_TYPE_CONFIG[type];
  if (!cfg) return null;
  const pad = size === 'xs' ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${pad}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span className="leading-none">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

interface SourceTypeBadgeProps {
  type: SourceType;
}

export function SourceTypeBadge({ type }: SourceTypeBadgeProps) {
  const cfg = SOURCE_TYPE_CONFIG[type];
  if (!cfg) return null;
  return (
    <span
      className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

interface ConfidenceBadgeProps {
  level: 'High' | 'Medium' | 'Low';
}

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const colors: Record<string, string> = {
    High: '#34d399',
    Medium: '#f59e0b',
    Low: '#f87171',
  };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: colors[level] }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: colors[level] }} />
      {level}
    </span>
  );
}

interface PaidBadgeProps {
  isPaid: boolean | 'unknown';
}

export function PaidBadge({ isPaid }: PaidBadgeProps) {
  if (isPaid === false) return null;
  if (isPaid === 'unknown') return null;
  return (
    <span className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10">
      Premium
    </span>
  );
}
