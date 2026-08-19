import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ExpandableRow } from '../components/ExpandableRow';
import { DifferentialGuruIcon, StrategyGuruIcon, TransferGuruIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface PickPlayer {
  webName: string;
  team: string | null;
}

interface MyPick {
  gameweekFplId: number;
  gameweekName: string;
  submittedAt: string;
  formation: string | null;
  transferIn: PickPlayer | null;
  transferOut: PickPlayer | null;
  differentialSucceed: PickPlayer | null;
  differentialBlank: PickPlayer | null;
  captain: PickPlayer | null;
}

function PlayerLine({ label, player }: { label: string; player: PickPlayer | null }) {
  return (
    <div className="flex items-baseline justify-between border-b py-1.5 text-xs" style={{ borderColor: 'var(--pw-border)' }}>
      <span style={{ color: 'var(--pw-fg-muted)' }}>{label}</span>
      <span style={{ color: 'var(--pw-fg)' }}>
        {player ? `${player.webName}${player.team ? ` · ${player.team}` : ''}` : '—'}
      </span>
    </div>
  );
}

export function MyPicks() {
  usePageTitle('My Picks — FantasyBrahma');
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth('/my-picks');

  const { data: picks, isLoading } = useQuery<MyPick[]>({
    queryKey: ['picks', 'mine'],
    queryFn: async () => {
      const { data } = await api.get('/picks/mine');
      return data;
    },
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="py-4">
      <h1 className="mt-2 text-[1.2375rem]">My picks</h1>
      <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        Every gameweek you've made a call. Tap one to see the full picks.
      </p>

      <div className="mt-6">
        {isLoading && (
          <p className="py-4 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
            Loading…
          </p>
        )}

        {!isLoading && picks?.length === 0 && (
          <div className="py-6 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
            No picks yet.{' '}
            <Link to="/challenges" className="pw-focus" style={{ color: 'var(--pw-accent)' }}>
              Make this week's picks
            </Link>
            .
          </div>
        )}

        {picks?.map((pick) => (
          <ExpandableRow
            key={pick.gameweekFplId}
            summary={
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--pw-fg)' }}>
                  {pick.gameweekName}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
                  Submitted {new Date(pick.submittedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </p>
              </div>
            }
          >
            <div className="flex flex-col gap-4 pl-1">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
                  <TransferGuruIcon size={14} style={{ color: 'var(--pw-accent)' }} />
                  Transfer Guru
                </p>
                <PlayerLine label="In" player={pick.transferIn} />
                <PlayerLine label="Out" player={pick.transferOut} />
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
                  <DifferentialGuruIcon size={14} style={{ color: 'var(--pw-accent)' }} />
                  Differential Guru
                </p>
                <PlayerLine label="To succeed" player={pick.differentialSucceed} />
                <PlayerLine label="To blank" player={pick.differentialBlank} />
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
                  <StrategyGuruIcon size={14} style={{ color: 'var(--pw-accent)' }} />
                  Strategy Guru
                </p>
                <div className="flex items-baseline justify-between border-b py-1.5 text-xs" style={{ borderColor: 'var(--pw-border)' }}>
                  <span style={{ color: 'var(--pw-fg-muted)' }}>Formation</span>
                  <span style={{ color: 'var(--pw-fg)' }}>{pick.formation ?? '—'}</span>
                </div>
                <PlayerLine label="Captain" player={pick.captain} />
              </div>
            </div>
          </ExpandableRow>
        ))}
      </div>
    </div>
  );
}
