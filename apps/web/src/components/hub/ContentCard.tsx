import { ExternalLink, Clock, User } from 'lucide-react';
import type { ContentLink } from '../../data/contentLinks';
import { ContentTypeBadge, SourceTypeBadge, PaidBadge } from './Badge';
import { formatDate } from '../../utils/aggregations';

interface ContentCardProps {
  link: ContentLink;
  featured?: boolean;
}

export function ContentCard({ link, featured = false }: ContentCardProps) {
  const {
    title,
    url,
    sourceName,
    expertName,
    contentType,
    publishedAt,
    summary,
    playersMentioned,
    isPaid,
    readTime,
    sourceType,
  } = link;

  if (featured) {
    return (
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex flex-col gap-3 hover:border-violet-500/40 hover:bg-slate-800/90 transition-all duration-200 hub-card-glow shadow-hub-card group">
        <div className="flex items-start justify-between gap-2">
          <ContentTypeBadge type={contentType} />
          <div className="flex items-center gap-1.5 shrink-0">
            <SourceTypeBadge type={sourceType} />
            <PaidBadge isPaid={isPaid} />
          </div>
        </div>

        <h3 className="text-slate-100 font-semibold text-sm leading-snug group-hover:text-violet-200 transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 flex-1">
          {summary}
        </p>

        {playersMentioned.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {playersMentioned.slice(0, 5).map(p => (
              <span
                key={p}
                className="text-[10px] bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-auto">
          <div className="flex items-center gap-3 min-w-0">
            {expertName && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                <User size={10} className="shrink-0" />
                {expertName}
              </span>
            )}
            <span className="text-[11px] text-slate-600">{sourceName}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {publishedAt && (
              <span className="text-[11px] text-slate-500">{formatDate(publishedAt)}</span>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 hover:text-violet-200 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border border-violet-500/20"
              onClick={e => e.stopPropagation()}
            >
              Read Original
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2.5 hover:bg-slate-800/90 hover:border-slate-600/70 hover:shadow-hub-card-hover transition-all duration-200 shadow-hub-card group">
      <div className="flex items-center justify-between gap-2">
        <ContentTypeBadge type={contentType} size="xs" />
        <div className="flex items-center gap-1.5">
          <PaidBadge isPaid={isPaid} />
          <SourceTypeBadge type={sourceType} />
        </div>
      </div>

      <h3 className="text-slate-100 font-medium text-xs leading-snug line-clamp-2 group-hover:text-white transition-colors">
        {title}
      </h3>

      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 flex-1">
        {summary}
      </p>

      {playersMentioned.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {playersMentioned.slice(0, 3).map(p => (
            <span
              key={p}
              className="text-[10px] bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded-full border border-slate-600/40"
            >
              {p}
            </span>
          ))}
          {playersMentioned.length > 3 && (
            <span className="text-[10px] text-slate-500">+{playersMentioned.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 mt-auto">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-slate-500 truncate">{sourceName}</span>
          {readTime && readTime !== 'Tool' && readTime !== 'Video' && readTime !== 'Podcast' && readTime !== 'Social' && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-600">
              <Clock size={9} />
              {readTime}
            </span>
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-0.5 shrink-0"
          onClick={e => e.stopPropagation()}
        >
          Open <ExternalLink size={9} />
        </a>
      </div>
    </div>
  );
}
