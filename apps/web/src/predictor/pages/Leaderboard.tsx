import { useState } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { GameweekBadge } from '../components/GameweekBadge';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { ExpandableRow } from '../components/ExpandableRow';
import { DifferentialGuruIcon, OracleIcon, StrategyGuruIcon, TransferGuruIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';
import { getLeaderboard, type LeaderboardKey } from '../mock/experts';

const TABS: { key: LeaderboardKey; label: string; icon: typeof OracleIcon }[] = [
  { key: 'oracle', label: 'The Brahma', icon: OracleIcon },
  { key: 'transfer', label: 'Transfer', icon: TransferGuruIcon },
  { key: 'differential', label: 'Differential', icon: DifferentialGuruIcon },
  { key: 'strategy', label: 'Strategy', icon: StrategyGuruIcon },
];

function DeltaArrow({ delta }: { delta: number }) {
  if (delta > 0) return <ArrowUp size={14} className="pw-positive" />;
  if (delta < 0) return <ArrowDown size={14} className="pw-negative" />;
  return <Minus size={14} style={{ color: 'var(--pw-fg-muted)' }} />;
}

export function Leaderboard() {
  usePageTitle('Guru Leaderboard — FantasyBrahma');

  const [tab, setTab] = useState<LeaderboardKey>('oracle');
  const rows = getLeaderboard(tab);

  return (
    <div className="py-10 sm:py-16">
      <GameweekBadge />
      <h1 className="mt-2 text-3xl sm:text-4xl">Leaderboard</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        Who's actually good at this. Tap a row to look deeper.
      </p>

      <div className="mt-5">
        <SegmentedTabs tabs={TABS} active={tab} onChange={(key) => setTab(key as LeaderboardKey)} />
      </div>

      <div className="mt-4">
        {rows.map((expert, index) => (
          <ExpandableRow
            key={expert.id}
            summary={
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-medium" style={{ color: 'var(--pw-fg-muted)' }}>
                  {index + 1}
                </span>
                <DeltaArrow delta={expert.delta} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{expert.name}</p>
                  <p className="truncate text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
                    {expert.topMove}
                  </p>
                </div>
                <span className="pw-display text-lg">{expert.score}</span>
              </div>
            }
          >
            <div className="flex flex-col gap-4 pl-8">
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
                  By challenge
                </p>
                <div className="flex gap-4 text-sm">
                  <span>Transfer {expert.byChallenge.transfer}</span>
                  <span>Differential {expert.byChallenge.differential}</span>
                  <span>Strategy {expert.byChallenge.strategy}</span>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
                  Form
                </p>
                <div className="flex gap-4 text-sm">
                  <span>Hit rate {expert.hitRate}%</span>
                  <span>Streak {expert.streak}</span>
                  <span>{expert.handle}</span>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
                  Recent
                </p>
                <ul className="flex flex-col gap-1 text-sm">
                  {expert.recentPicks.map((pick) => (
                    <li key={pick}>{pick}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ExpandableRow>
        ))}
      </div>
    </div>
  );
}
