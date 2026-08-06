import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe, Play, X as XIcon, Mic, Users, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { SOURCES } from '../../data/sources';
import { CONTENT_LINKS } from '../../data/contentLinks';
import { getContentTypeDistribution, getSourceActiveGWs } from '../../utils/aggregations';
import { ContentCard } from '../../components/hub/ContentCard';
import { ContentTypeBadge } from '../../components/hub/Badge';
import { SOURCE_TYPE_CONFIG } from '../../config/contentTypes';
import type { Source } from '../../data/sources';

function SourceTypeIcon({ type, size = 20 }: { type: Source['type']; size?: number }) {
  const icons = { website: Globe, youtube: Play, x: XIcon, podcast: Mic, community: Users, tool: Wrench };
  const Icon = icons[type];
  return <Icon size={size} />;
}

export function SourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const source = SOURCES.find(s => s.id === id);
  const links = useMemo(
    () => CONTENT_LINKS.filter(l => l.sourceId === id),
    [id]
  );
  const typeDistribution = useMemo(() => getContentTypeDistribution(links), [links]);
  const activeGWs = useMemo(() => (id ? getSourceActiveGWs(id, CONTENT_LINKS) : []), [id]);

  if (!source) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 text-sm mb-4 transition-colors">
          ← Back to Sources
        </button>
        <p className="text-slate-500 text-sm">Source not found.</p>
      </div>
    );
  }

  const cfg = SOURCE_TYPE_CONFIG[source.type];

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs mb-6 transition-colors group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Sources
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-slate-700/50">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: cfg?.bg ?? 'rgba(255,255,255,0.06)', color: cfg?.color ?? '#94a3b8' }}
        >
          <SourceTypeIcon type={source.type} size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100">{source.name}</h1>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ color: cfg?.color, background: cfg?.bg }}
            >
              {source.type}
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{source.description}</p>
        </div>
        <a
          href={source.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 px-4 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 border border-violet-500/20"
        >
          Visit Source <ExternalLink size={12} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Stats */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 shadow-hub-card">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Articles</span>
              <span className="text-sm font-bold text-slate-100">{links.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Active Gameweeks</span>
              <div className="flex gap-1">
                {activeGWs.map(gw => (
                  <span key={gw} className="text-[10px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600/40">
                    GW{gw}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Source Type</span>
              <span className="text-xs capitalize font-medium" style={{ color: cfg?.color }}>
                {source.type}
              </span>
            </div>
          </div>
        </div>

        {/* Content Types */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 shadow-hub-card md:col-span-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Content Coverage
          </h3>
          {typeDistribution.length === 0 ? (
            <p className="text-slate-500 text-xs">No content types recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {typeDistribution.map(({ type, count }) => (
                <div key={type} className="flex items-center gap-2">
                  <ContentTypeBadge type={type} size="xs" />
                  <span className="text-[10px] text-slate-500">×{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Content */}
      <div>
        <h2 className="text-sm font-semibold text-slate-100 mb-4">
          All Content from {source.name}
          <span className="text-slate-400 font-normal ml-2">({links.length})</span>
        </h2>
        {links.length === 0 ? (
          <p className="text-slate-500 text-sm py-10 text-center border border-slate-700/40 rounded-xl bg-slate-800/30">
            No articles indexed for this source.
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
