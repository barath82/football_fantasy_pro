import { useMemo } from 'react';
import { SOURCES } from '../../data/sources';
import { CONTENT_LINKS } from '../../data/contentLinks';
import { getLinkCountPerSource, getSourceActiveGWs } from '../../utils/aggregations';
import { SourceCard } from '../../components/hub/SourceCard';
import { SOURCE_TYPE_CONFIG, ALL_SOURCE_TYPES } from '../../config/contentTypes';

export function Sources() {
  const linkCounts = useMemo(() => getLinkCountPerSource(CONTENT_LINKS), []);

  const byType = useMemo(() => {
    const groups: Record<string, typeof SOURCES> = {};
    for (const st of ALL_SOURCE_TYPES) {
      const srcs = SOURCES.filter(s => s.type === st);
      if (srcs.length > 0) groups[st] = srcs;
    }
    return groups;
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">
          Sources
          <span className="text-slate-400 font-normal ml-2 text-lg">{SOURCES.length} tracked</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          All fantasy football sources aggregated in this hub.
        </p>
      </div>

      {/* Source type summary */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALL_SOURCE_TYPES.map(st => {
          const cfg = SOURCE_TYPE_CONFIG[st];
          const count = SOURCES.filter(s => s.type === st).length;
          if (count === 0) return null;
          return (
            <div
              key={st}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
              style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}25` }}
            >
              <span className="capitalize">{st}</span>
              <span className="opacity-60">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Sources grouped by type */}
      {Object.entries(byType).map(([type, sources]) => {
        const cfg = SOURCE_TYPE_CONFIG[type as keyof typeof SOURCE_TYPE_CONFIG];
        return (
          <section key={type} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: cfg?.color ?? '#94a3b8' }}
              />
              <h2 className="text-slate-200 font-semibold text-sm capitalize">{type}</h2>
              <span className="text-slate-500 text-xs">{sources.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {sources.map(source => (
                <SourceCard
                  key={source.id}
                  source={source}
                  linkCount={linkCounts.get(source.id) ?? 0}
                  activeGWs={getSourceActiveGWs(source.id, CONTENT_LINKS)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
