import { useState, useMemo } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { CONTENT_LINKS } from '../../data/contentLinks';
import { SOURCES } from '../../data/sources';
import type { HubFilters } from '../../components/hub/FilterPanel';
import { FilterPanel, DEFAULT_FILTERS } from '../../components/hub/FilterPanel';
import { ContentCard } from '../../components/hub/ContentCard';
import { ContentTable } from '../../components/hub/ContentTable';
import { filterBySearch, getAllPlayers } from '../../utils/aggregations';

type ViewMode = 'grid' | 'table';

export function ContentExplorer() {
  const [filters, setFilters] = useState<HubFilters>(DEFAULT_FILTERS);
  const [view, setView] = useState<ViewMode>('grid');

  const allPlayers = useMemo(() => getAllPlayers(CONTENT_LINKS), []);
  const sourceList = useMemo(
    () => SOURCES.map(s => ({ id: s.id, name: s.name })),
    []
  );

  const filtered = useMemo(() => {
    let links = CONTENT_LINKS;
    if (filters.gw !== null) links = links.filter(l => l.gameweek === filters.gw);
    if (filters.contentType) links = links.filter(l => l.contentType === filters.contentType);
    if (filters.sourceType) links = links.filter(l => l.sourceType === filters.sourceType);
    if (filters.sourceId) links = links.filter(l => l.sourceId === filters.sourceId);
    if (filters.paid !== null) links = links.filter(l => l.isPaid === filters.paid);
    if (filters.search) links = filterBySearch(links, filters.search);
    return links;
  }, [filters]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">
          Content Explorer
          <span className="text-slate-400 font-normal ml-2 text-lg">All Gameweeks</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse and filter all {CONTENT_LINKS.length} curated links across 5 mock gameweeks.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          sources={sourceList}
          players={allPlayers}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 gap-2 flex-1 max-w-sm focus-within:border-violet-500/50 transition-colors shadow-hub-card">
              <Search size={13} className="text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search titles, players, tags..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
              />
            </div>
            <span className="text-slate-500 text-xs whitespace-nowrap">{filtered.length} results</span>
            <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-lg p-0.5 gap-0.5 ml-auto shadow-hub-card">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-violet-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-1.5 rounded transition-colors ${view === 'table' ? 'bg-violet-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List size={13} />
              </button>
            </div>
          </div>

          {/* Content */}
          {view === 'grid' ? (
            filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm border border-slate-700/40 rounded-xl bg-slate-800/30">
                No content matches your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(link => (
                  <ContentCard key={link.id} link={link} />
                ))}
              </div>
            )
          ) : (
            <ContentTable links={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
