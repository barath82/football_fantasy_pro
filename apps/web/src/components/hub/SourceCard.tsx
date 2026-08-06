import { useNavigate } from 'react-router-dom';
import { Globe, Play, X as XIcon, Mic, Users, Wrench, ExternalLink } from 'lucide-react';
import type { Source } from '../../data/sources';
import { SOURCE_TYPE_CONFIG } from '../../config/contentTypes';

function SourceIcon({ type, size = 16 }: { type: Source['type']; size?: number }) {
  const icons = {
    website: Globe,
    youtube: Play,
    x: XIcon,
    podcast: Mic,
    community: Users,
    tool: Wrench,
  };
  const Icon = icons[type];
  return <Icon size={size} />;
}

interface SourceCardProps {
  source: Source;
  linkCount: number;
  activeGWs: number[];
}

export function SourceCard({ source, linkCount, activeGWs }: SourceCardProps) {
  const navigate = useNavigate();
  const cfg = SOURCE_TYPE_CONFIG[source.type];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/sources/${source.id}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/sources/${source.id}`)}
      className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/70 hover:bg-slate-800/90 hover:shadow-hub-card-hover transition-all duration-200 shadow-hub-card cursor-pointer group flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
          style={{ background: cfg?.bg ?? 'rgba(255,255,255,0.06)', color: cfg?.color ?? '#94a3b8' }}
        >
          <SourceIcon type={source.type} size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-slate-100 font-semibold text-sm truncate group-hover:text-white transition-colors">
            {source.name}
          </h3>
          <span
            className="inline-block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-px rounded mt-0.5"
            style={{ color: cfg?.color, background: cfg?.bg }}
          >
            {source.type}
          </span>
        </div>
        <a
          href={source.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-slate-600 hover:text-violet-400 transition-colors shrink-0 mt-0.5"
        >
          <ExternalLink size={12} />
        </a>
      </div>

      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{source.description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 mt-auto">
        <span className="text-[11px] text-slate-400 font-medium">{linkCount} articles</span>
        <div className="flex gap-1">
          {activeGWs.map(gw => (
            <span key={gw} className="text-[10px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600/40">
              GW{gw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
