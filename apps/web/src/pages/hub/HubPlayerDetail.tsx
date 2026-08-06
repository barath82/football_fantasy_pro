import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Globe } from 'lucide-react';
import { useMemo } from 'react';
import { CONTENT_LINKS } from '../../data/contentLinks';
import { SOURCES } from '../../data/sources';
import { getContentForPlayer, getContentTypeDistribution } from '../../utils/aggregations';
import { ContentCard } from '../../components/hub/ContentCard';
import { ContentTypeBadge } from '../../components/hub/Badge';

export function HubPlayerDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const playerName = name ? decodeURIComponent(name) : '';

  const links = useMemo(
    () => getContentForPlayer(playerName, CONTENT_LINKS),
    [playerName]
  );

  const sources = useMemo(() => {
    const activeIds = new Set(links.map(l => l.sourceId));
    return SOURCES.filter(s => activeIds.has(s.id));
  }, [links]);

  const typeDistribution = useMemo(() => getContentTypeDistribution(links), [links]);

  const gwMentions = useMemo(() => {
    const m: Record<number, number> = {};
    for (const link of links) {
      m[link.gameweek] = (m[link.gameweek] ?? 0) + 1;
    }
    return m;
  }, [links]);

  const maxGWMentions = Math.max(...Object.values(gwMentions), 1);

  if (!playerName) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-8 text-slate-500 text-sm">
        Player not found.
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs mb-6 transition-colors group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Players
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-slate-700/50">
        <div className="w-16 h-16 bg-violet-500/15 rounded-2xl flex items-center justify-center shrink-0">
          <span className="text-3xl font-bold text-violet-400">
            {playerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{playerName}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileText size={13} />
              {links.length} {links.length === 1 ? 'article' : 'articles'}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={13} />
              {sources.length} {sources.length === 1 ? 'source' : 'sources'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Gameweek Timeline */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 shadow-hub-card">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Mentions by Gameweek
          </h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(gw => {
              const count = gwMentions[gw] ?? 0;
              const pct = maxGWMentions > 0 ? (count / maxGWMentions) * 100 : 0;
              return (
                <div key={gw} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-8 shrink-0">GW{gw}</span>
                  <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500/70 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-4 text-right shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 shadow-hub-card">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Content Types
          </h3>
          <div className="space-y-2">
            {typeDistribution.slice(0, 6).map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between gap-2">
                <ContentTypeBadge type={type} size="xs" />
                <span className="text-xs text-slate-400 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 shadow-hub-card">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Discussed By
          </h3>
          <div className="space-y-2">
            {sources.map(source => {
              const sourceLinks = links.filter(l => l.sourceId === source.id);
              return (
                <div key={source.id} className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 truncate">{source.name}</span>
                  <span className="text-xs text-violet-400 font-medium shrink-0 ml-2">
                    {sourceLinks.length}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* All Content */}
      <div>
        <h2 className="text-sm font-semibold text-slate-100 mb-4">
          All Articles Mentioning {playerName}
          <span className="text-slate-400 font-normal ml-2">({links.length})</span>
        </h2>
        {links.length === 0 ? (
          <p className="text-slate-500 text-sm py-10 text-center border border-slate-700/40 rounded-xl bg-slate-800/30">
            No content found for this player.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {links.map(link => (
              <ContentCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
