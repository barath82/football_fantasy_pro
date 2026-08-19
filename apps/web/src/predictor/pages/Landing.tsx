import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { GameweekBadge } from '../components/GameweekBadge';
import { SectionBlock } from '../components/SectionBlock';
import { BrahmaIcon, DifferentialGuruIcon, StrategyGuruIcon, TransferGuruIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';

const FEATURES = [
  { icon: TransferGuruIcon, title: 'Transfer Guru', body: 'One in, one out. Track your net points every week.' },
  { icon: DifferentialGuruIcon, title: 'Differential Guru', body: 'Nail the <10% hit. Call the >20% blank.' },
  { icon: StrategyGuruIcon, title: 'Strategy Guru', body: 'Set your formation and captain. Best structure wins.' },
];

export function Landing() {
  usePageTitle('FantasyBrahma — Fantasy EPL in one minute a week');

  return (
    <div className="py-4">
      <BrahmaIcon size={32} style={{ color: 'var(--pw-accent)' }} />
      <div className="mt-4">
        <GameweekBadge suffix="open now" />
      </div>

      <h1 className="mt-2.5 text-[1.35rem] leading-[1.2]">
        Brahma is the guru of all <span style={{ color: 'var(--pw-accent)' }}>gurus</span>.
      </h1>

      <div className="mt-5 flex flex-col gap-3 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        <p>
          The expert among all experts. That's the seat everyone here is playing for — and FantasyBrahma is how you
          earn it, one gameweek at a time.
        </p>
        <p className="flex items-start gap-2" style={{ color: 'var(--pw-fg)' }}>
          <Clock size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--pw-accent)' }} />
          <span>
            We spend hours every week on fantasy content — podcasts, threads, spreadsheets, scout picks. This one
            needs a minute to complete.
          </span>
        </p>
        <p>
          Three gurus, six calls, built on top of the official EPL game. Points accumulate across the season and the
          leaderboard tells the truth. Whoever sits on top at the end is the Brahma.
        </p>
        <p>Free. No team management. Just picks.</p>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Link
          to="/challenges"
          className="pw-focus rounded-full px-4 py-2 text-center text-[0.73rem] font-medium"
          style={{ background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }}
        >
          Play this week
        </Link>
        <Link
          to="/leaderboard"
          className="pw-focus rounded-full px-4 py-2 text-center text-[0.73rem] font-medium"
          style={{ border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
        >
          See the leaderboard
        </Link>
      </div>

      <SectionBlock divider={false} className="mt-2">
        <div className="flex flex-col">
          {FEATURES.map((f) => (
            <div key={f.title} className="py-3.5" style={{ borderTop: '1px solid var(--pw-border)' }}>
              <f.icon size={22} style={{ color: 'var(--pw-accent)' }} />
              <h3 className="pw-display mt-2 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
