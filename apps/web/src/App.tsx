import { Routes, Route, Outlet } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { PlayersPage } from './pages/players/PlayersPage';
import { PlayerDetailPage } from './pages/players/PlayerDetailPage';
import { GameweeksPage } from './pages/gameweeks/GameweeksPage';
import { TeamsPage } from './pages/teams/TeamsPage';
import { FixturesPage } from './pages/fixtures/FixturesPage';
import { ComparePage } from './pages/compare/ComparePage';
import { HubLayout } from './components/hub/HubLayout';
import { GameweekHub } from './pages/hub/GameweekHub';
import { ContentExplorer } from './pages/hub/ContentExplorer';
import { HubPlayers } from './pages/hub/HubPlayers';
import { HubPlayerDetail } from './pages/hub/HubPlayerDetail';
import { Sources } from './pages/hub/Sources';
import { SourceDetail } from './pages/hub/SourceDetail';
import { Trending } from './pages/hub/Trending';

function StatsLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Content Intelligence Hub */}
      <Route element={<HubLayout />}>
        <Route index element={<GameweekHub />} />
        <Route path="/explore" element={<ContentExplorer />} />
        <Route path="/intelligence/players" element={<HubPlayers />} />
        <Route path="/intelligence/players/:name" element={<HubPlayerDetail />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/sources/:id" element={<SourceDetail />} />
        <Route path="/trending" element={<Trending />} />
      </Route>

      {/* FPL Statistics Dashboard (existing Mantine app) */}
      <Route element={<StatsLayout />}>
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:id" element={<PlayerDetailPage />} />
        <Route path="/gameweeks" element={<GameweeksPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Route>
    </Routes>
  );
}
