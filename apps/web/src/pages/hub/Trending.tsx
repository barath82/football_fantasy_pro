import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from 'recharts';
import { CONTENT_LINKS } from '../../data/contentLinks';
import {
  getSortedPlayerMentions,
  getSortedTeamMentions,
  getContentTypeDistribution,
  getLinkCountPerSource,
} from '../../utils/aggregations';
import { SOURCES } from '../../data/sources';
import { CONTENT_TYPE_CONFIG } from '../../config/contentTypes';

const CHART_COLORS = [
  '#7c3aed', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
  '#84cc16', '#f59e0b', '#f97316', '#ef4444', '#ec4899',
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function DarkTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-violet-300 font-bold">{payload[0].value} mentions</p>
    </div>
  );
}

function PieTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0] as unknown as { name: string; value: number; payload: { fill: string } };
  return (
    <div className="bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-medium" style={{ color: p.payload?.fill ?? '#94a3b8' }}>{p.name}</p>
      <p className="text-slate-400">{p.value} articles</p>
    </div>
  );
}

export function Trending() {
  const topPlayers = useMemo(() => getSortedPlayerMentions(CONTENT_LINKS).slice(0, 12), []);
  const topTeams = useMemo(() => getSortedTeamMentions(CONTENT_LINKS).slice(0, 10), []);
  const typeDistribution = useMemo(() => getContentTypeDistribution(CONTENT_LINKS), []);
  const linkCounts = useMemo(() => getLinkCountPerSource(CONTENT_LINKS), []);

  const sourcesRanked = useMemo(() =>
    SOURCES.map(s => ({ name: s.name, id: s.id, count: linkCounts.get(s.id) ?? 0 }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count),
    [linkCounts]
  );

  const pieData = useMemo(() =>
    typeDistribution.slice(0, 8).map(({ type, count }, i) => ({
      name: type,
      value: count,
      fill: CONTENT_TYPE_CONFIG[type]?.color ?? CHART_COLORS[i % CHART_COLORS.length],
    })),
    [typeDistribution]
  );

  const gwCounts = useMemo(() => {
    const m: Record<number, number> = {};
    for (const l of CONTENT_LINKS) {
      m[l.gameweek] = (m[l.gameweek] ?? 0) + 1;
    }
    return [1, 2, 3, 4, 5].map(gw => ({ gw: `GW${gw}`, count: m[gw] ?? 0 }));
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Trending
          <span className="text-slate-400 font-normal ml-2 text-lg">Across All Gameweeks</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Insights derived from {CONTENT_LINKS.length} curated links.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Most Mentioned Players */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 shadow-hub-card">
          <h2 className="text-sm font-semibold text-slate-100 mb-1">Most Mentioned Players</h2>
          <p className="text-[11px] text-slate-500 mb-5">Total mentions across all curated content</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topPlayers} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topPlayers.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.8 - i * 0.04} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Content Type Distribution */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 shadow-hub-card">
          <h2 className="text-sm font-semibold text-slate-100 mb-1">Content Type Distribution</h2>
          <p className="text-[11px] text-slate-500 mb-5">Share of each content category in total links</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map(({ name, value, fill }) => (
                <div key={name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: fill }} />
                    <span className="text-[11px] text-slate-400 truncate">{name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Source Activity */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 shadow-hub-card">
          <h2 className="text-sm font-semibold text-slate-100 mb-1">Most Active Sources</h2>
          <p className="text-[11px] text-slate-500 mb-5">Total articles indexed per source</p>
          <div className="space-y-3">
            {sourcesRanked.map((s, i) => {
              const maxCount = sourcesRanked[0]?.count ?? 1;
              const pct = (s.count / maxCount) * 100;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-600 w-4 shrink-0 font-medium">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300 truncate">{s.name}</span>
                      <span className="text-xs text-violet-400 font-semibold shrink-0 ml-2">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                          opacity: 0.75,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content per Gameweek */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 shadow-hub-card">
          <h2 className="text-sm font-semibold text-slate-100 mb-1">Content per Gameweek</h2>
          <p className="text-[11px] text-slate-500 mb-5">How many links are curated per mock gameweek</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gwCounts} margin={{ left: -10, right: 10 }}>
              <XAxis
                dataKey="gw"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 text-xs shadow-xl">
                      <p className="text-slate-400 mb-1">{label}</p>
                      <p className="text-violet-300 font-bold">{payload[0].value} links</p>
                    </div>
                  );
                }}
                cursor={{ fill: 'rgba(148,163,184,0.05)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {gwCounts.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Mentioned Teams */}
      <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 shadow-hub-card">
        <h2 className="text-sm font-semibold text-slate-100 mb-1">Most Mentioned Teams</h2>
        <p className="text-[11px] text-slate-500 mb-5">Club coverage across all curated content</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {topTeams.map(({ name, count }, i) => {
            const maxCount = topTeams[0]?.count ?? 1;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div
                key={name}
                className="bg-slate-700/30 border border-slate-700/50 rounded-lg p-3 text-center hover:bg-slate-700/50 transition-colors"
              >
                <div
                  className="text-xl font-bold mb-1"
                  style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
                >
                  {count}
                </div>
                <div className="text-[11px] text-slate-300 truncate font-medium">{name}</div>
                <div className="mt-2 h-1 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: CHART_COLORS[i % CHART_COLORS.length],
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
