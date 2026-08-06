import { X } from 'lucide-react';
import type { ContentType, SourceType } from '../../data/contentLinks';
import { ALL_CONTENT_TYPES, ALL_SOURCE_TYPES, MOCK_GWS, CONTENT_TYPE_CONFIG, SOURCE_TYPE_CONFIG } from '../../config/contentTypes';

export interface HubFilters {
  gw: number | null;
  contentType: ContentType | null;
  sourceType: SourceType | null;
  sourceId: string | null;
  player: string | null;
  paid: boolean | null;
  search: string;
}

export const DEFAULT_FILTERS: HubFilters = {
  gw: null,
  contentType: null,
  sourceType: null,
  sourceId: null,
  player: null,
  paid: null,
  search: '',
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}

interface FilterPanelProps {
  filters: HubFilters;
  onChange: (filters: HubFilters) => void;
  sources: Array<{ id: string; name: string }>;
  players?: string[];
}

export function FilterPanel({ filters, onChange, sources }: FilterPanelProps) {
  function toggle<K extends keyof HubFilters>(key: K, value: HubFilters[K]) {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  }

  function clearAll() {
    onChange(DEFAULT_FILTERS);
  }

  const hasFilters =
    filters.gw !== null ||
    filters.contentType !== null ||
    filters.sourceType !== null ||
    filters.sourceId !== null ||
    filters.player !== null ||
    filters.paid !== null ||
    filters.search !== '';

  return (
    <div className="w-56 shrink-0">
      <div className="sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-300">Filters</span>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>

        <Section label="Gameweek">
          <div className="flex flex-wrap gap-1.5">
            {MOCK_GWS.map(gw => (
              <button
                key={gw}
                onClick={() => toggle('gw', gw)}
                className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium border ${
                  filters.gw === gw
                    ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                GW{gw}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Content Type">
          <div className="space-y-0.5">
            {ALL_CONTENT_TYPES.map(ct => {
              const cfg = CONTENT_TYPE_CONFIG[ct];
              const active = filters.contentType === ct;
              return (
                <button
                  key={ct}
                  onClick={() => toggle('contentType', ct)}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    active
                      ? 'bg-slate-700/70 text-slate-100 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span style={{ color: active ? cfg.color : undefined }}>{cfg.icon}</span>
                  {ct}
                </button>
              );
            })}
          </div>
        </Section>

        <Section label="Source Type">
          <div className="flex flex-wrap gap-1.5">
            {ALL_SOURCE_TYPES.map(st => {
              const cfg = SOURCE_TYPE_CONFIG[st];
              const active = filters.sourceType === st;
              return (
                <button
                  key={st}
                  onClick={() => toggle('sourceType', st)}
                  className={`px-2 py-1 text-[11px] rounded-md transition-all font-medium capitalize border ${
                    active
                      ? 'border-current'
                      : 'bg-slate-800 text-slate-500 border-slate-700/50 hover:text-slate-300 hover:bg-slate-700/60'
                  }`}
                  style={active ? { background: cfg?.bg, color: cfg?.color, borderColor: `${cfg?.color}40` } : {}}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </Section>

        <Section label="Source">
          <div className="space-y-0.5 max-h-40 overflow-y-auto">
            {sources.map(s => (
              <button
                key={s.id}
                onClick={() => toggle('sourceId', s.id)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                  filters.sourceId === s.id
                    ? 'bg-slate-700/70 text-slate-100 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Access">
          <div className="flex gap-2">
            {[
              { label: 'Free', value: false },
              { label: 'Premium', value: true },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => toggle('paid', opt.value)}
                className={`flex-1 py-1.5 text-xs rounded-md transition-all font-medium border ${
                  filters.paid === opt.value
                    ? opt.value
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border-slate-700/50 hover:text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
