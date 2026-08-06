import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { CONTENT_LINKS } from '../../data/contentLinks';
import { getSortedPlayerMentions, getContentForPlayer } from '../../utils/aggregations';
import { PlayerCard } from '../../components/hub/PlayerCard';

export function HubPlayers() {
  const [search, setSearch] = useState('');

  const players = useMemo(() => {
    return getSortedPlayerMentions(CONTENT_LINKS).map(({ name, count }) => {
      const links = getContentForPlayer(name, CONTENT_LINKS);
      const sourceCount = new Set(links.map(l => l.sourceId)).size;
      const gameweeks = [...new Set(links.map(l => l.gameweek))].sort((a, b) => a - b);
      const contentTypes = [...new Set(links.map(l => l.contentType))];
      return { name, count, sourceCount, gameweeks, contentTypes };
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return players;
    const q = search.toLowerCase();
    return players.filter(p => p.name.toLowerCase().includes(q));
  }, [players, search]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">
          Player Intelligence
          <span className="text-slate-400 font-normal ml-2 text-lg">All Mentions</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {players.length} players mentioned across {CONTENT_LINKS.length} curated links.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 gap-2 max-w-xs mb-6 focus-within:border-violet-500/50 transition-colors shadow-hub-card">
        <Search size={13} className="text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
        />
      </div>

      {/* Top players highlight */}
      {!search && (
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Top 3 Most Discussed
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {players.slice(0, 3).map(({ name, count, sourceCount, gameweeks, contentTypes }, i) => (
              <div key={name} className="relative">
                <div
                  className="absolute -top-2 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10"
                  style={{
                    background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#b45309',
                    color: '#0f172a',
                  }}
                >
                  {i + 1}
                </div>
                <PlayerCard
                  name={name}
                  mentions={count}
                  sourceCount={sourceCount}
                  gameweeks={gameweeks}
                  contentTypes={contentTypes}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All players */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {search ? `${filtered.length} results` : 'All Players'}
        </p>
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm py-10 text-center border border-slate-700/40 rounded-xl bg-slate-800/30">
            No players found.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {filtered.map(({ name, count, sourceCount, gameweeks, contentTypes }) => (
              <PlayerCard
                key={name}
                name={name}
                mentions={count}
                sourceCount={sourceCount}
                gameweeks={gameweeks}
                contentTypes={contentTypes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
