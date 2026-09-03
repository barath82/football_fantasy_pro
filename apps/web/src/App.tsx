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
import { ThemeProvider } from './predictor/theme/ThemeProvider';
import { PredictorLayout } from './predictor/components/PredictorLayout';
import { Landing } from './predictor/pages/Landing';
import { Challenges } from './predictor/pages/Challenges';
import { Leaderboard } from './predictor/pages/Leaderboard';
import { About } from './predictor/pages/About';
import { Scoring } from './predictor/pages/Scoring';
import { Signup } from './predictor/pages/Signup';
import { Login } from './predictor/pages/Login';
import { ForgotPassword } from './predictor/pages/ForgotPassword';
import { ResetPassword } from './predictor/pages/ResetPassword';
import { MyPicks } from './predictor/pages/MyPicks';
import { MyFplData } from './predictor/pages/MyFplData';
import { Account } from './predictor/pages/Account';

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
      {/* Pitchwise — gamified predictor game (current direction) */}
      <Route element={<ThemeProvider><PredictorLayout /></ThemeProvider>}>
        <Route index element={<Landing />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/scoring" element={<Scoring />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/my-picks" element={<MyPicks />} />
        <Route path="/my-fpl" element={<MyFplData />} />
        <Route path="/account" element={<Account />} />
      </Route>

      {/* Content Intelligence Hub (previous pivot — kept for salvage, not linked from nav) */}
      <Route path="/legacy-hub" element={<HubLayout />}>
        <Route index element={<GameweekHub />} />
        <Route path="explore" element={<ContentExplorer />} />
        <Route path="intelligence/players" element={<HubPlayers />} />
        <Route path="intelligence/players/:name" element={<HubPlayerDetail />} />
        <Route path="sources" element={<Sources />} />
        <Route path="sources/:id" element={<SourceDetail />} />
        <Route path="trending" element={<Trending />} />
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
