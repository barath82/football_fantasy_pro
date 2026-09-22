import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGameweekReview } from '../hooks/useFplProfile';
import { pickHeadlineInsight, pickStandoutMove } from '../lib/gameweekInsight';

function formatRankMove(movement: number | null): string | null {
  if (movement == null || movement === 0) return null;
  const arrow = movement > 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(movement).toLocaleString()} RANK`;
}

/**
 * The homepage hook — "what happened to me last week?" — not the full
 * review. Renders nothing for anonymous visitors (the page stays pure
 * marketing for them); a connect-CTA if logged in without a linked FPL
 * team; the real card once linked.
 */
export function LastGameweekCard() {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const { data: review, isLoading: reviewLoading } = useGameweekReview(isAuthenticated && !!user?.fplTeamId);

  if (authLoading || !isAuthenticated) return null;

  if (!user?.fplTeamId) {
    return (
      <div className="mt-6 rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
        <p className="text-sm" style={{ color: 'var(--pw-fg)' }}>
          Want to know how well you actually managed your FPL team?
        </p>
        <Link
          to="/my-fpl"
          className="pw-focus mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--pw-accent)' }}
        >
          Connect your FPL team <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  if (reviewLoading || !review) return null;

  const rankMove = formatRankMove(review.rankImpact.rankMovement);
  const standoutMove = pickStandoutMove(review);

  return (
    <Link
      to="/my-fpl"
      className="pw-focus mt-6 block rounded-lg p-4"
      style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
        Your last gameweek
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="pw-display text-lg" style={{ color: 'var(--pw-fg)' }}>
          {review.rankImpact.points} pts
        </span>
        <span className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          GW{review.gameweek}
        </span>
        {rankMove && (
          <span className="text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
            {rankMove}
          </span>
        )}
      </div>

      <p className="mt-2.5 text-sm" style={{ color: 'var(--pw-fg)' }}>
        {pickHeadlineInsight(review)}
      </p>

      {standoutMove && (
        <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          {standoutMove}
        </p>
      )}

      <span
        className="pw-focus mt-3 inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: 'var(--pw-accent)' }}
      >
        See your full review <ArrowRight size={14} />
      </span>
    </Link>
  );
}
