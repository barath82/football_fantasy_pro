import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ContentLink } from '../../data/contentLinks';
import { ContentCard } from './ContentCard';

interface ContentSectionProps {
  title: string;
  icon: string;
  items: ContentLink[];
  maxItems?: number;
  onSeeAll?: () => void;
  featured?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
}

export function ContentSection({
  title,
  icon,
  items,
  maxItems = 4,
  onSeeAll,
  featured = false,
  emptyMessage = 'No content for this gameweek.',
  children,
}: ContentSectionProps) {
  const visible = items.slice(0, maxItems);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">{icon}</span>
          <h2 className="text-slate-100 font-semibold text-sm tracking-tight">{title}</h2>
          <span className="text-slate-500 text-xs font-medium bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/50">
            {items.length}
          </span>
        </div>
        {onSeeAll && items.length > 0 && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors"
          >
            See all <ChevronRight size={13} />
          </button>
        )}
      </div>

      {children}

      {!children && visible.length === 0 && (
        <p className="text-slate-500 text-sm py-6 text-center border border-slate-700/40 rounded-xl bg-slate-800/30">
          {emptyMessage}
        </p>
      )}

      {!children && visible.length > 0 && (
        <div
          className={`grid gap-4 ${
            featured
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {visible.map(link => (
            <ContentCard key={link.id} link={link} featured={featured} />
          ))}
        </div>
      )}
    </section>
  );
}
