import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { FplSnapshotCard } from '../components/FplSnapshotCard';
import { FplLeaguesSection } from '../components/FplLeaguesSection';
import { FplTransferHistory } from '../components/FplTransferHistory';
import { GameweekReviewSection } from '../components/GameweekReviewSection';
import { SeasonContextStrip } from '../components/SeasonContextStrip';
import { LinkFplBanner } from '../components/LinkFplBanner';

const TABS = [
  { key: 'review', label: 'Review' },
  { key: 'season', label: 'Season' },
  { key: 'leagues', label: 'Leagues' },
  { key: 'transfers', label: 'Transfers' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * Everything derived from the user's linked FPL team — separate from My
 * Picks, which is FantasyBrahma's own Guru challenge picks. Live-fetched
 * from FPL on every visit, nothing stored on our side. Gameweek Review is
 * the primary experience ("how did I do, why did my rank move, which
 * decisions helped/hurt") — the rest of the existing FPL info is still here,
 * just as secondary tabs.
 */
export function MyFplData() {
  usePageTitle('My FPL Data - FantasyBrahma');
  const { isLoading: authLoading, isAuthenticated, user } = useRequireAuth('/my-fpl');
  const [tab, setTab] = useState<TabKey>('review');

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="pt-[22.4px] pb-10 sm:pt-[35.84px] sm:pb-16">
      <h1 className="mt-2 text-3xl sm:text-4xl">My FPL data</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        Pulled live from your linked FPL team.
      </p>

      <div className="mt-8">
        {user?.fplTeamId ? (
          <>
            <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--pw-surface-2)', width: 'fit-content' }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className="pw-focus rounded-md px-3.5 py-1.5 text-sm font-medium"
                  style={
                    tab === t.key
                      ? { background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }
                      : { color: 'var(--pw-fg-muted)' }
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === 'review' && <GameweekReviewSection />}

              {tab === 'season' && (
                <div className="flex flex-col gap-4">
                  <FplSnapshotCard enabled />
                  <SeasonContextStrip enabled />
                </div>
              )}

              {tab === 'leagues' && <FplLeaguesSection enabled />}

              {tab === 'transfers' && <FplTransferHistory enabled />}
            </div>
          </>
        ) : (
          <LinkFplBanner />
        )}
      </div>
    </div>
  );
}
