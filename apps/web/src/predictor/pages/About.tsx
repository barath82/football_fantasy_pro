import {
  BrahmaIcon,
  CSGuruIcon,
  ChipGuruIcon,
  DifferentialGuruIcon,
  StrategyGuruIcon,
  TransferGuruIcon,
} from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';

const GURU_LINES = [
  {
    icon: DifferentialGuruIcon,
    name: 'The Differential Guru',
    rest: " carries Brahma's gift for seeing the overlooked — the player nobody owns, waiting to explode.",
  },
  {
    icon: ChipGuruIcon,
    name: 'The Chip Guru',
    rest: ' holds the wisdom of timing — knowing that even the right decision, played on the wrong week, is wasted.',
  },
  {
    icon: StrategyGuruIcon,
    name: 'The Strategy Guru',
    rest: ' understands shape and structure — that a formation is a wager on where the points will fall.',
  },
  {
    icon: TransferGuruIcon,
    name: 'The Transfer Guru',
    rest: ' governs change itself — the eternal fantasy dilemma of who to release and who to bring in.',
  },
  {
    icon: CSGuruIcon,
    name: 'The CS Guru',
    rest: ' reads risk where others see certainty — daring to back the unlikely wall and doubt the favorite.',
  },
];

export function About() {
  usePageTitle('The Myth of the Five Gurus — FantasyBrahma');

  return (
    <div className="py-16 sm:py-24">
      <BrahmaIcon size={40} style={{ color: 'var(--pw-accent)' }} />
      <p className="pw-eyebrow mt-6">About the game</p>

      <h1 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
        The Myth of the Five <span style={{ color: 'var(--pw-accent)' }}>Gurus</span>
      </h1>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        <p>
          Fantasy football is its own small chaos. Fifteen players, a hundred permutations, one deadline every week —
          and everyone, from a first-season manager to a fifteen-year veteran, is really asking the same handful of
          questions: Do I trust my gut on this pick? Should I gamble on a differential nobody owns? Is the safe,
          boring choice actually the smart one? Which shape puts points on my bench and which one loads my starting
          XI?
        </p>

        <p>
          Every Hindu tradition holds Brahma as the Creator — the source of the four Vedas, seen through his four
          ever-watching faces turned to the four directions of the universe. Where Vishnu preserves and Shiva
          transforms, Brahma's domain is origination: the first spark of knowledge, order pulled from chaos.
        </p>

        <p>
          Brahma looked upon this chaos and did what he has always done — he created order through knowledge. But
          even a four-faced Creator cannot watch every match, every fixture, every gameweek deadline alone. So he
          formed five Gurus, each entrusted with a single fragment of his omniscience, and sent them into the world
          of fantasy football to answer one question, every single week, in full public view.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        {GURU_LINES.map((g) => (
          <div key={g.name} className="pw-guru-card flex gap-4 rounded-lg p-5">
            <g.icon size={26} className="shrink-0" style={{ color: 'var(--pw-accent)' }} />
            <div>
              <h2 className="pw-display text-base">{g.name}</h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
                {g.rest.replace(/^ /, '')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed" style={{ color: 'var(--pw-fg-muted)' }}>
        <p>
          None of the five Gurus claims wisdom by title alone. Each one makes a public call, every gameweek, and is
          scored openly against the result. That is the one rule Brahma set down: knowledge must be proven, not
          merely proclaimed. FantasyBrahma exists to carry out that rule — a live, transparent scoreboard of fantasy
          football judgment, gameweek after gameweek, so you can see for yourself which instincts hold up and which
          ones don't.
        </p>

        <p>
          At its root, this isn't a mythology site or a novelty game. It's a mirror. Every Guru challenge maps to a
          decision you are already making in your own team — trust your gut, chase the differential, stick with the
          boring pick, pick your shape, time your chip. FantasyBrahma turns those private guesses into public,
          trackable, provable results — a running, gameweek-by-gameweek answer to the question every fantasy manager
          silently asks: was I right, or did I just think I was?
        </p>
      </div>

      <p className="mt-16 text-center text-2xl font-medium italic leading-snug tracking-tight sm:text-3xl">
        Five Gurus. One Creator. Infinite gameweeks.
      </p>
    </div>
  );
}
