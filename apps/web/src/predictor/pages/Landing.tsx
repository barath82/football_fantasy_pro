import { Link } from 'react-router-dom';
import { GameweekBadge } from '../components/GameweekBadge';
import { SectionBlock } from '../components/SectionBlock';

const FEATURES = [
  { title: 'Transfer Guru', body: 'One in, one out. Track your net points every week.' },
  { title: 'Differential Guru', body: 'Nail the <10% hit. Call the >20% blank.' },
  { title: 'Strategy Guru', body: 'Set your formation and captain. Best structure wins.' },
];

export function Landing() {
  return (
    <div className="py-4">
      <GameweekBadge suffix="open now" />

      <h1 className="mt-2.5 text-[1.35rem] leading-[1.2]">Prove you know fantasy football.</h1>

      <div className="mt-5 flex flex-col gap-3 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        <p>
          Everyone thinks they've got the best takes on FPL. Pitchwise is a weekly challenge game built on top of the
          official EPL fantasy — a way to actually settle it.
        </p>
        <p>
          Make your calls across six micro-challenges. Points accumulate over the season. The leaderboard tells the
          truth. The Oracle is whoever's on top when the dust clears.
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
              <h3 className="pw-display text-sm font-semibold">{f.title}</h3>
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
