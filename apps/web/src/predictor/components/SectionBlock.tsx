import type { ReactNode } from 'react';

interface SectionBlockProps {
  title?: string;
  description?: string;
  children: ReactNode;
  divider?: boolean;
  className?: string;
}

/** A single Gutenberg-style stacked block: optional heading, body, thin divider below. */
export function SectionBlock({ title, description, children, divider = true, className = '' }: SectionBlockProps) {
  return (
    <section className={`py-6 ${className}`}>
      {title && <h2 className="pw-display text-lg">{title}</h2>}
      {description && (
        <p className="mt-1 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          {description}
        </p>
      )}
      <div className={title || description ? 'mt-4' : ''}>{children}</div>
      {divider && <hr className="pw-divider mt-6" />}
    </section>
  );
}
