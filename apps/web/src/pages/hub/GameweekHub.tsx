import { useNavigate } from 'react-router-dom';
import { Link2, Globe, TrendingUp, Tag, BarChart3 } from 'lucide-react';
import { useHubStore } from '../../store/hub.store';
import { CONTENT_LINKS } from '../../data/contentLinks';
import { SOURCES } from '../../data/sources';
import {
  getGWContent,
  getContentByType,
  getActiveSources,
  getSortedPlayerMentions,
  getLinkCountPerSource,
  getSourceActiveGWs,
  getMostDiscussedPlayer,
  getTopContentType,
} from '../../utils/aggregations';
import { StatCard } from '../../components/hub/StatCard';
import { ContentSection } from '../../components/hub/ContentSection';
import { ContentTable } from '../../components/hub/ContentTable';
import { PlayerCard } from '../../components/hub/PlayerCard';
import { SourceCard } from '../../components/hub/SourceCard';

function FplStatsWidget() {
  const mock = [
    { label: 'Top Ownership', players: ['Haaland 72.4%', 'Salah 61.2%', 'Palmer 48.8%'] },
    { label: 'Most Transferred In', players: ['Saka +185k', 'Mbeumo +120k', 'Gordon +98k'] },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
      {mock.map(widget => (
        <div key={widget.label} className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 shadow-hub-card">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-400">{widget.label}</h4>
            <span className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium">
              Mock · API coming
            </span>
          </div>
          <div className="space-y-2.5">
            {widget.players.map((p, i) => (
              <div key={p} className="flex items-center gap-2.5">
                <span className="text-[10px] text-slate-600 font-medium w-3">{i + 1}</span>
                <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500/70 rounded-full"
                    style={{ width: `${90 - i * 20}%` }}
                  />
                </div>
                <span className="text-xs text-slate-300 font-medium min-w-[80px] text-right">{p}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GameweekHub() {
  const { selectedGW } = useHubStore();
  const navigate = useNavigate();

  const gwLinks = getGWContent(selectedGW, CONTENT_LINKS);
  const activeSources = getActiveSources(gwLinks, SOURCES);
  const topPlayer = getMostDiscussedPlayer(gwLinks);
  const topCategory = getTopContentType(gwLinks);
  const sortedPlayers = getSortedPlayerMentions(gwLinks);
  const linkCounts = getLinkCountPerSource(CONTENT_LINKS);

  const featured = gwLinks.filter(l => l.confidenceLabel === 'High').slice(0, 3);
  const captaincy = getContentByType(gwLinks, 'Captaincy');
  const transfers = getContentByType(gwLinks, 'Transfer Tips');
  const differentials = getContentByType(gwLinks, 'Differentials');
  const teamReveals = getContentByType(gwLinks, 'Team Reveal');
  const watchlist = getContentByType(gwLinks, 'Watchlist');
  const fixtureAnalysis = getContentByType(gwLinks, 'Fixture Analysis');

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
      {/* GW Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">
            Active Gameweek
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">
          Gameweek {selectedGW}
          <span className="text-slate-400 font-normal ml-2 text-lg">Intelligence Hub</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {gwLinks.length} curated links · {activeSources.length} active sources · Simulated season data
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard
          label="Curated Links"
          value={gwLinks.length}
          icon={<Link2 size={16} />}
          sub={`${CONTENT_LINKS.length} total across all GWs`}
        />
        <StatCard
          label="Active Sources"
          value={activeSources.length}
          icon={<Globe size={16} />}
          sub={`of ${SOURCES.length} tracked sources`}
        />
        <StatCard
          label="Most Discussed"
          value={topPlayer}
          icon={<TrendingUp size={16} />}
          sub="player this gameweek"
          accent
        />
        <StatCard
          label="Top Category"
          value={topCategory}
          icon={<Tag size={16} />}
          sub="most coverage this GW"
        />
      </div>

      {/* Featured */}
      <ContentSection
        title="Featured This Week"
        icon="⭐"
        items={featured.length > 0 ? featured : gwLinks.slice(0, 3)}
        maxItems={3}
        featured
        onSeeAll={() => navigate('/explore')}
      />

      {/* FPL Mock Widgets */}
      <section className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <BarChart3 size={15} className="text-slate-500" />
          <h2 className="text-slate-100 font-semibold text-sm">FPL Stats</h2>
          <span className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium">
            Mock · API Ready
          </span>
        </div>
        <FplStatsWidget />
      </section>

      {/* Captaincy Hub */}
      <ContentSection
        title="Captaincy Hub"
        icon="⚔️"
        items={captaincy}
        maxItems={4}
        onSeeAll={() => navigate('/explore')}
        emptyMessage="No captaincy content for this gameweek."
      />

      {/* Transfer Centre */}
      <ContentSection
        title="Transfer Centre"
        icon="🔄"
        items={transfers}
        maxItems={4}
        onSeeAll={() => navigate('/explore')}
        emptyMessage="No transfer content for this gameweek."
      />

      {/* Differentials */}
      <ContentSection
        title="Differentials"
        icon="🎯"
        items={differentials}
        maxItems={4}
        onSeeAll={() => navigate('/explore')}
        emptyMessage="No differentials content for this gameweek."
      />

      {teamReveals.length > 0 && (
        <ContentSection title="Team Reveals" icon="👁️" items={teamReveals} maxItems={4} onSeeAll={() => navigate('/explore')} />
      )}

      {watchlist.length > 0 && (
        <ContentSection title="Watchlist" icon="👀" items={watchlist} maxItems={4} />
      )}

      {fixtureAnalysis.length > 0 && (
        <ContentSection title="Fixture Analysis" icon="📅" items={fixtureAnalysis} maxItems={4} />
      )}

      {/* Most Discussed Players */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">🔥</span>
            <h2 className="text-slate-100 font-semibold text-sm">Most Discussed Players</h2>
            <span className="text-slate-500 text-xs font-medium bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/50">
              {sortedPlayers.length}
            </span>
          </div>
          <button
            onClick={() => navigate('/intelligence/players')}
            className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {sortedPlayers.slice(0, 6).map(({ name, count }) => {
            const playerLinks = gwLinks.filter(l =>
              l.playersMentioned.some(p => p.toLowerCase() === name.toLowerCase())
            );
            const sourceCount = new Set(playerLinks.map(l => l.sourceId)).size;
            const contentTypes = [...new Set(playerLinks.map(l => l.contentType))];
            return (
              <PlayerCard
                key={name}
                name={name}
                mentions={count}
                sourceCount={sourceCount}
                gameweeks={[selectedGW]}
                contentTypes={contentTypes}
              />
            );
          })}
        </div>
      </section>

      {/* Active Sources */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">📡</span>
            <h2 className="text-slate-100 font-semibold text-sm">Active Sources</h2>
            <span className="text-slate-500 text-xs font-medium bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/50">
              {activeSources.length}
            </span>
          </div>
          <button
            onClick={() => navigate('/sources')}
            className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors"
          >
            All sources →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {activeSources.map(source => (
            <SourceCard
              key={source.id}
              source={source}
              linkCount={linkCounts.get(source.id) ?? 0}
              activeGWs={getSourceActiveGWs(source.id, CONTENT_LINKS)}
            />
          ))}
        </div>
      </section>

      {/* All Content Table */}
      <section className="mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-base leading-none">📋</span>
          <h2 className="text-slate-100 font-semibold text-sm">All Content — GW{selectedGW}</h2>
          <span className="text-slate-500 text-xs font-medium bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/50">
            {gwLinks.length}
          </span>
        </div>
        <ContentTable links={gwLinks} />
      </section>
    </div>
  );
}
