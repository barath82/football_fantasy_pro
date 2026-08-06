import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, icon, sub, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-4 border transition-all flex items-start gap-4 shadow-hub-card hover:shadow-hub-card-hover ${
        accent
          ? 'bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/15'
          : 'bg-slate-800 border-slate-700/60 hover:border-slate-600/80 hover:bg-slate-800/90'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          accent ? 'bg-violet-500/20' : 'bg-slate-700/70'
        }`}
      >
        <span className={accent ? 'text-violet-400' : 'text-slate-400'}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium mb-0.5 truncate">{label}</p>
        <p className={`font-bold text-lg leading-none truncate ${accent ? 'text-violet-300' : 'text-slate-100'}`}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-slate-500 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}
