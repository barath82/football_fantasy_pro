import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GameweekBadge } from '../components/GameweekBadge';
import {
  BrahmaIcon,
  CSGuruIcon,
  ChipGuruIcon,
  DifferentialGuruIcon,
  StrategyGuruIcon,
  TransferGuruIcon,
} from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';

const GURUS = [
  { icon: TransferGuruIcon, title: 'Transfer Guru', body: 'One in, One out. Judged on the swing and not the story.' },
  { icon: DifferentialGuruIcon, title: 'Differential Guru', body: 'Finds the player nobody owns, before everybody wishes they had.' },
  { icon: StrategyGuruIcon, title: 'Strategy Guru', body: 'Back a formation, not a team. Which shape scores when it matters?' },
  { icon: ChipGuruIcon, title: 'Chip Guru', body: 'Timing is everything. Right chip, right week - or wasted entirely.' },
  { icon: CSGuruIcon, title: 'CS Guru', body: 'Risk has a price. Some walls hold when nobody expects it.' },
];

export function Landing() {
  usePageTitle('FantasyBrahma — Five Gurus. One Creator. Infinite gameweeks.');

  return (
    <div className="pt-[17.2px] pb-16 sm:pt-[25.81px] sm:pb-24">
      <BrahmaIcon size={40} style={{ color: 'var(--pw-accent)' }} />
      <div className="mt-6">
        <GameweekBadge suffix="open now" />
      </div>

      <h1 className="mt-[17.6px] text-4xl leading-[1.05] sm:text-6xl">
        <span className="text-[18.9px] xl:whitespace-nowrap xl:text-[21px]">Same content. Same picks. Same boring mini-league.</span>
        <br></br>
        <span style={{ color: 'var(--pw-accent)' }}>Time to break the herd.</span> {' '}
      </h1>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        <p>
          Before every deadline, fantasy football is chaos - transfers, captains, team formations, chips - multiple
          sites/forums to navigate, hour long podcasts and videos to consume - infinite possibilities but finite
          time. Brahma sees it all at once through his four faces, so he deployed five Gurus to create a game to
          prove, week after week, which fantasy instincts actually hold up.
        </p>

        <div>
          <h2 className="pw-display mb-2 text-base" style={{ color: 'var(--pw-fg)' }}>
            The problem, in one line.
          </h2>
          <p>
            Every FPL site sells the same captain picks and differentials dressed differently. We score ours instead
            of just publishing them - so you can finally tell who's actually right.
          </p>
        </div>

        <div>
          <h2 className="pw-display mb-2 text-base" style={{ color: 'var(--pw-fg)' }}>
            Play this game and become a better FPL manager
          </h2>
          <p>
            Five Gurus, five weekly calls - differentials, captains, chips, formations, clean sheets. Pick your own
            answer alongside them and see how you stack up.
          </p>
        </div>

        <p style={{ color: 'var(--pw-fg)' }}>Knowledge is Free and so is this game.</p>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          to="/challenges"
          className="pw-focus pw-cta-primary inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium"
          style={{ background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }}
        >
          Make your first call <ArrowRight size={16} />
        </Link>
        <Link
          to="/leaderboard"
          className="pw-focus pw-cta-secondary inline-flex items-center gap-2 text-sm"
          style={{ color: 'var(--pw-fg-muted)' }}
        >
          See the leaderboard <ArrowRight size={14} />
        </Link>
      </div>

      <h2 className="pw-display mt-[52px] text-xl">Meet the Gurus</h2>

      <div className="mt-8 grid gap-5 sm:grid-cols-6">
        {GURUS.map((g, i) => (
          <div
            key={g.title}
            className={`pw-guru-card rounded-lg p-5 sm:col-span-2 ${i === 3 ? 'sm:col-start-2' : ''}`}
          >
            <g.icon size={26} style={{ color: 'var(--pw-accent)' }} />
            <h3 className="pw-display mt-3 text-base">{g.title}</h3>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
              {g.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-[76.8px] text-center text-2xl font-medium italic leading-snug tracking-tight sm:text-3xl">
        Five Gurus. One Creator. Infinite gameweeks.
      </p>
    </div>
  );
}
