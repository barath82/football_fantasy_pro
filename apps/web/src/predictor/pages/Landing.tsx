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
    <div className="py-16 sm:py-24">
      <BrahmaIcon size={40} style={{ color: 'var(--pw-accent)' }} />
      <div className="mt-6">
        <GameweekBadge suffix="open now" />
      </div>

      <h1 className="mt-4 text-4xl leading-[1.05] sm:text-6xl">
        Brahma is the guru of all <span style={{ color: 'var(--pw-accent)' }}>gurus</span>.
      </h1>

      <div className="mt-10 flex flex-col gap-5 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        <p>
          The expert among all experts. That's the seat everyone here is playing for — and FantasyBrahma is how you
          earn it, one gameweek at a time.
        </p>
        <p className="flex items-start gap-2.5" style={{ color: 'var(--pw-fg)' }}>
          <Clock size={16} className="mt-1 shrink-0" style={{ color: 'var(--pw-accent)' }} />
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

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          to="/challenges"
          className="pw-focus inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
          style={{ background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }}
        >
          Play this week
        </Link>
        <Link to="/leaderboard" className="pw-focus text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          See the leaderboard
        </Link>
      </div>

      <SectionBlock divider={false} className="mt-20">
        <div className="grid gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="pt-5" style={{ borderTop: '1px solid var(--pw-border)' }}>
              <f.icon size={26} style={{ color: 'var(--pw-accent)' }} />
              <h3 className="pw-display mt-3 text-base">{f.title}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
