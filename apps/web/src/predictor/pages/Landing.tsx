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
    <div className="pt-[17.2px] pb-[25.6px] sm:pt-[25.81px] sm:pb-[38.4px]">
      <BrahmaIcon size={40} style={{ color: 'var(--pw-accent)' }} />
      <div className="mt-6">
        <GameweekBadge suffix="open now" />
      </div>

      <h1 className="mt-[12.32px] text-4xl leading-[1.05] sm:text-6xl">
        <span className="text-[18.9px] xl:whitespace-nowrap xl:text-[21px]">Same content. Same picks. Same boring mini-league.</span>
        <br></br>
        <span className="text-[28.8px] sm:text-[48px]" style={{ color: 'var(--pw-accent)' }}>
          Time to break the herd.
        </span>{' '}
      </h1>

      {/* WHAT — condensed intro */}
      <h2 className="pw-display mt-10 text-[23.4px]">What</h2>
      <div className="mt-3 flex flex-col gap-6 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        <p style={{ color: 'var(--pw-fg)' }}>
          Five Gurus. Five weekly calls. Built on top of your actual FPL game — no team import, no stakes, just
          picks.
        </p>
        <p>
          Legend has it Brahma sees every gameweek at once through his four faces — every fixture, every form curve,
          every deadline. So he sent five Gurus into the game, each to test one decision every manager already
          makes: your captain, your differential, your chip timing, your formation, your transfer.
        </p>
        <Link to="/about" className="pw-focus pw-cta-secondary inline-flex items-center gap-2 text-sm w-fit" style={{ color: 'var(--pw-fg-muted)' }}>
          Read the full story <ArrowRight size={14} />
        </Link>
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
        <Link
          to="/scoring"
          className="pw-focus pw-cta-secondary inline-flex items-center gap-2 text-sm"
          style={{ color: 'var(--pw-fg-muted)' }}
        >
          See how scoring works <ArrowRight size={14} />
        </Link>
      </div>

      {/* WHY — the problem, sharpened */}
      <h2 className="pw-display mt-14 text-[23.4px]">Why</h2>
      <div className="mt-3 flex flex-col gap-6 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        <div>
          <h3 className="pw-display mb-2 text-base" style={{ color: 'var(--pw-fg)', fontWeight: 400 }}>
            Here's what's actually happened to FPL.
          </h3>
          <p>
            Open ten sites before a deadline and you get the same captain, the same three differentials, the same
            chip-strategy thread — just reworded. Half of it's AI-generated now, and it shows. Everyone's reading
            the same takes, so everyone's building the same team. The chips get played on the same gameweek. The
            "differentials" aren't even differentials anymore, because 40% of the league owns them too.
          </p>
        </div>
        <p style={{ color: 'var(--pw-fg)' }}>
          The game hasn't gotten harder. It's gotten quieter. The fun of backing your own read has been
          consensus-ed out of existence.
        </p>
      </div>

      {/* HOW / VALUE — the payoff */}
      <h2 className="pw-display mt-10 text-[23.4px]">How / Value</h2>
      <div className="mt-3 flex flex-col gap-6 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        <p>
          Last season's top FantasyBrahma manager had never played FPL before. No history, no favorite pundit, no
          inherited chip plan. He just made calls — and beat managers who'd been playing for a decade.
        </p>
        <p>
          That's not luck. That's what happens when you back your gut instead of the herd, and actually track
          whether it works. FantasyBrahma is a live proving ground for that instinct — five weekly calls that turn
          your private "I think this is the pick" into a public, scored result. Win or lose, you learn something
          real about your own game — not what an "expert" thinks, but what actually works when you commit to it.
        </p>
        <p>
          Play it as a side game. Use it to sharpen the calls you make in your real team. Either way, it's the
          spark that makes the season fun to argue about again — especially in your mini-league group chat.
        </p>
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

      <p className="mt-[38.4px] text-center text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
        Five Gurus. One Creator. Infinite gameweeks.
      </p>
    </div>
  );
}
