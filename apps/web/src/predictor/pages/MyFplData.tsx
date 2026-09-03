import { usePageTitle } from '../hooks/usePageTitle';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { FplSnapshotCard } from '../components/FplSnapshotCard';
import { FplLeaguesSection } from '../components/FplLeaguesSection';
import { FplTransferHistory } from '../components/FplTransferHistory';
import { LinkFplBanner } from '../components/LinkFplBanner';

/**
 * Everything derived from the user's linked FPL team — separate from My
 * Picks, which is FantasyBrahma's own Guru challenge picks. Live-fetched
 * from FPL on every visit, nothing stored on our side.
 */
export function MyFplData() {
  usePageTitle('My FPL Data - FantasyBrahma');
  const { isLoading: authLoading, isAuthenticated, user } = useRequireAuth('/my-fpl');

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="pt-[22.4px] pb-10 sm:pt-[35.84px] sm:pb-16">
      <h1 className="mt-2 text-3xl sm:text-4xl">My FPL data</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        Pulled live from your linked FPL team — rank, leagues, and transfers.
      </p>

      <div className="mt-8">
        {user?.fplTeamId ? (
          <div className="flex flex-col gap-8">
            <FplSnapshotCard enabled />

            <section>
              <h2 className="pw-display text-lg" style={{ color: 'var(--pw-fg)' }}>
                Private leagues
              </h2>
              <div className="mt-3">
                <FplLeaguesSection enabled />
              </div>
            </section>

            <section>
              <h2 className="pw-display text-lg" style={{ color: 'var(--pw-fg)' }}>
                Transfer history
              </h2>
              <div className="mt-3">
                <FplTransferHistory enabled />
              </div>
            </section>
          </div>
        ) : (
          <LinkFplBanner />
        )}
      </div>
    </div>
  );
}
