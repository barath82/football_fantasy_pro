import type { ComponentType, ReactNode, SVGProps } from 'react';

interface ChallengeBlockProps {
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  title: string;
  description: string;
  children: ReactNode;
  /** Dims the whole block and swaps in `disabledNote` — e.g. Transfer Guru on Gameweek 1. */
  disabled?: boolean;
  disabledNote?: string;
}

/** One challenge category (e.g. "Transfer Guru") holding its pick controls. */
export function ChallengeBlock({ icon: Icon, title, description, children, disabled = false, disabledNote }: ChallengeBlockProps) {
  return (
    <div className="py-5" style={{ borderBottom: '1px solid var(--pw-border)', opacity: disabled ? 0.65 : 1 }}>
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={22} style={{ color: 'var(--pw-accent)' }} />}
        <h3 className="pw-display text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        {disabled && disabledNote ? disabledNote : description}
      </p>
      <div className="mt-3.5 flex flex-col gap-3">{children}</div>
    </div>
  );
}
