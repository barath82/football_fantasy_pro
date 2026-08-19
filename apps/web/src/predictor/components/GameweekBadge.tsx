import { useCurrentGameweek } from '../../hooks/useGameweeks';
import { Countdown } from './Countdown';

interface GameweekBadgeProps {
  /** Trailing copy after the gameweek label, e.g. "open now". */
  suffix?: string;
  /** Show the live "closes in ..." countdown beneath the gameweek label. */
  showCountdown?: boolean;
}

/**
 * Real gameweek number from the live API (gameweeks.isCurrent/isNext).
 * Falls back to "Gameweek 1" — not "Preseason" — when nothing is flagged
 * current yet, since the product default before a season starts is GW1,
 * not a blank state. Once the new season is synced, this reflects it live.
 */
export function GameweekBadge({ suffix, showCountdown = true }: GameweekBadgeProps) {
  const { current } = useCurrentGameweek();

  const gwNumber = current?.fplId ?? 1;
  const deadline = current?.deadlineTime ?? null;

  return (
    <div>
      <p className="pw-eyebrow">
        Gameweek {gwNumber}
        {suffix ? ` · ${suffix}` : ''}
      </p>
      {showCountdown &&
        (deadline ? (
          <Countdown target={deadline} />
        ) : (
          <p className="pw-eyebrow mt-2">Deadline TBD</p>
        ))}
    </div>
  );
}
