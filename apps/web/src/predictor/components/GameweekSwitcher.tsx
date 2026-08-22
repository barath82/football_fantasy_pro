import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import type { GwSummary } from '../../hooks/useGameweeks';
import { useDeadline } from '../hooks/useDeadline';
import { Countdown } from './Countdown';

interface GameweekSwitcherProps {
  gameweeks: GwSummary[] | undefined;
  selectedFplId: number;
  onChange: (fplId: number) => void;
}

/** Prev/Next gameweek navigator for the Challenges page — same pattern FPL's own site uses. */
export function GameweekSwitcher({ gameweeks, selectedFplId, onChange }: GameweekSwitcherProps) {
  const sorted = gameweeks ? [...gameweeks].sort((a, b) => a.fplId - b.fplId) : [];
  const index = sorted.findIndex((gw) => gw.fplId === selectedFplId);
  const gw = index >= 0 ? sorted[index] : undefined;
  const canGoPrev = index > 0;
  const canGoNext = index >= 0 && index < sorted.length - 1;

  const { expired } = useDeadline(gw?.deadlineTime ?? null);

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => canGoPrev && onChange(sorted[index - 1].fplId)}
        disabled={!canGoPrev}
        aria-label="Previous gameweek"
        className="pw-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:opacity-30"
        style={{ color: 'var(--pw-fg-muted)' }}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="min-w-[160px] text-center">
        <p className="pw-eyebrow flex items-center justify-center gap-1.5">
          {expired && <Lock size={11} />}
          {gw?.name ?? `Gameweek ${selectedFplId}`}
        </p>
        {gw?.deadlineTime && <Countdown target={gw.deadlineTime} />}
      </div>

      <button
        type="button"
        onClick={() => canGoNext && onChange(sorted[index + 1].fplId)}
        disabled={!canGoNext}
        aria-label="Next gameweek"
        className="pw-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:opacity-30"
        style={{ color: 'var(--pw-fg-muted)' }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
