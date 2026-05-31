import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { PlayersPage } from './pages/players/PlayersPage';
import { PlayerDetailPage } from './pages/players/PlayerDetailPage';
import { GameweeksPage } from './pages/gameweeks/GameweeksPage';
import { TeamsPage } from './pages/teams/TeamsPage';
import { FixturesPage } from './pages/fixtures/FixturesPage';
import { ComparePage } from './pages/compare/ComparePage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/players" replace />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:id" element={<PlayerDetailPage />} />
        <Route path="/gameweeks" element={<GameweeksPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </AppShell>
  );
}
