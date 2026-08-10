import type { ReactNode } from 'react';

interface ChallengeBlockProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** One challenge category (e.g. "Transfer Guru") holding its pick controls. */
export function ChallengeBlock({ title, description, children }: ChallengeBlockProps) {
  return (
    <div className="py-5" style={{ borderBottom: '1px solid var(--pw-border)' }}>
      <h3 className="pw-display text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        {description}
      </p>
      <div className="mt-3.5 flex flex-col gap-3">{children}</div>
    </div>
  );
}
