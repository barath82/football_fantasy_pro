import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  BrahmaIcon,
  CSGuruIcon,
  ChipGuruIcon,
  DifferentialGuruIcon,
  StrategyGuruIcon,
  TransferGuruIcon,
} from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';

const GURU_SCORING = [
  {
    icon: TransferGuruIcon,
    title: 'Transfer Guru',
    body: "One player in, one player out. We track both for the next 5 gameweeks and score the difference. A good swap isn't judged in a day - it's judged over a month, same as it would be for your own team.",
    helps: 'Shows whether "panic transfers" actually pay off compared to patience.',
  },
  {
    icon: DifferentialGuruIcon,
    title: 'Differential Guru',
    body: "A low-owned pick and a high-owned pick, every week. The lower the ownership on the hit, the more it's worth if it lands. The more popular the flop, the more it's worth if it disappoints.",
    helps: "A live read on whether chasing differentials is actually working this season, or just feels good.",
  },
  {
    icon: StrategyGuruIcon,
    title: 'Strategy Guru',
    body: "Captain call is scored against the average of the field's popular captains. Formation call is scored on points-per-slot, not raw totals - so stacking five midfielders isn't automatically the \"best\" shape.",
    helps: 'Tells you if your gut captain read beats the crowd, and whether your favorite formation is actually optimal or just familiar.',
  },
  {
    icon: ChipGuruIcon,
    title: 'Chip Guru',
    body: "Bench Boost is scored on your nominated bench's points that week. Triple Captain is scored on the extra points the third multiple earns. Free Hit is scored on how much better a one-week rebuild does versus sticking with your standing team. (Wildcard isn't scored - too many moving parts to judge fairly.)",
    helps: 'Turns "when should I play my chip" from a guess into a tracked pattern across the season.',
  },
  {
    icon: CSGuruIcon,
    title: 'CS Guru',
    body: 'Straight hit or miss - pick a risky team to keep a clean sheet, or a fancied team to fail to. We track your success rate all season, not just single calls.',
    helps: "Shows whether your read on defenses is sharper than the betting market's.",
  },
];

export function Scoring() {
  usePageTitle('Scoring - FantasyBrahma');

  return (
    <div className="pt-[22.4px] pb-10 sm:pt-[35.84px] sm:pb-16">
      <BrahmaIcon size={40} style={{ color: 'var(--pw-accent)' }} />
      <p className="pw-eyebrow mt-6">Scoring</p>

      <h1 className="mt-4 text-3xl sm:text-4xl">How every call gets scored.</h1>

      <p className="mt-6 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        No vibes, no "trust us." Every Guru's call is measured against what actually happened - here's the short
        version of how.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {GURU_SCORING.map((g) => (
          <div key={g.title} className="pw-guru-card flex gap-4 rounded-lg p-5">
            <g.icon size={26} className="shrink-0" style={{ color: 'var(--pw-accent)' }} />
            <div>
              <h2 className="pw-display text-base">{g.title}</h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
                {g.body}
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
                <span className="pw-display" style={{ color: 'var(--pw-fg)' }}>
                  Helps your team:
                </span>{' '}
                {g.helps}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-4 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        <p>
          Every Guru's history is public. Nobody claims to be right - they prove it, gameweek after gameweek.
        </p>
        <Link
          to="/about"
          className="pw-focus pw-cta-secondary inline-flex w-fit items-center gap-2 text-sm"
          style={{ color: 'var(--pw-fg-muted)' }}
        >
          Back to the Gurus <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
