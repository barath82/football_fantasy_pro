import { useNavigate } from 'react-router-dom';
import { User, FileText } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  mentions: number;
  sourceCount: number;
  gameweeks: number[];
  contentTypes: string[];
}

export function PlayerCard({ name, mentions, sourceCount, gameweeks, contentTypes }: PlayerCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/intelligence/players/${encodeURIComponent(name)}`)}
      className="w-full text-left bg-slate-800 border border-slate-700/50 rounded-xl p-4 hover:border-violet-500/40 hover:bg-slate-800/90 hover:shadow-hub-card-hover transition-all duration-200 shadow-hub-card group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-9 h-9 bg-violet-500/15 rounded-full flex items-center justify-center shrink-0 group-hover:bg-violet-500/25 transition-colors">
          <User size={16} className="text-violet-400" />
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-violet-400 leading-none">{mentions}</span>
          <p className="text-[10px] text-slate-500 mt-0.5">mentions</p>
        </div>
      </div>

      <h3 className="text-slate-100 font-semibold text-sm mb-1 group-hover:text-white transition-colors truncate">
        {name}
      </h3>

      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <FileText size={10} />
          {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {gameweeks.map(gw => (
          <span
            key={gw}
            className="text-[10px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded font-medium border border-slate-600/40"
          >
            GW{gw}
          </span>
        ))}
      </div>

      {contentTypes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {contentTypes.slice(0, 2).map(ct => (
            <span key={ct} className="text-[10px] text-slate-600">
              {ct}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
