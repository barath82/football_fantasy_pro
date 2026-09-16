import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGameweeks } from '../../hooks/useGameweeks';
import { useGameweekReview } from '../hooks/useFplProfile';
import { RankImpactCard } from './RankImpactCard';
import { TransferImpactCard } from './TransferImpactCard';
import { CaptaincyCard } from './CaptaincyCard';
import { LineupEfficiencyCard } from './LineupEfficiencyCard';
import { DifferentialImpactCard } from './DifferentialImpactCard';
import { DecisionHighlights } from './DecisionHighlights';
import { QuickManagementSummary, type SummaryTileKey } from './QuickManagementSummary';

/**
 * The primary experience on My FPL Data — "how did I do, why did my rank
 * move, which decisions helped or hurt." Defaults to the latest completed
 * gameweek; prev/next steps through other finished ones. An in-progress
 * gameweek is never selectable here — its numbers aren't final.
 *
 * Layout follows "summary first, details second": top-line score → best
 * decision/biggest miss → four tappable summary tiles, each revealing its
 * own detailed card only once tapped, so the page doesn't dump every stat
 * on the user at once.
 */
export function GameweekReviewSection() {
  const { data: gameweeks } = useGameweeks();
  const [selectedGw, setSelectedGw] = useState<number | null>(null);
  const [expandedTile, setExpandedTile] = useState<SummaryTileKey | null>(null);

  const { data: review, isLoading, isError, error } = useGameweekReview(true, selectedGw ?? undefined);

  const finished = (gameweeks ?? []).filter((gw) => gw.finished).sort((a, b) => a.fplId - b.fplId);
  const currentGw = selectedGw ?? review?.gameweek ?? null;
  const idx = currentGw != null ? finished.findIndex((gw) => gw.fplId === currentGw) : -1;
  const prevGw = idx > 0 ? finished[idx - 1] : null;
  const nextGw = idx >= 0 && idx < finished.length - 1 ? finished[idx + 1] : null;

  function selectGw(fplId: number) {
    setSelectedGw(fplId);
    setExpandedTile(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => prevGw && selectGw(prevGw.fplId)}
          disabled={!prevGw}
          aria-label="Previous gameweek"
          className="pw-focus disabled:opacity-30"
          style={{ color: 'var(--pw-fg-muted)' }}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="pw-display text-sm" style={{ color: 'var(--pw-fg)' }}>
          {review ? `GW${review.gameweek} review` : 'Loading…'}
        </span>
        <button
          type="button"
          onClick={() => nextGw && selectGw(nextGw.fplId)}
          disabled={!nextGw}
          aria-label="Next gameweek"
          className="pw-focus disabled:opacity-30"
          style={{ color: 'var(--pw-fg-muted)' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading && (
        <p className="text-center text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          Loading review…
        </p>
      )}

      {isError && (
        <p className="text-center text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          {(error as any)?.response?.data?.message ?? "Couldn't load this gameweek's review."}
        </p>
      )}

      {review && !isLoading && (
        <>
          <div className="text-center">
            <p className="pw-display text-3xl" style={{ color: 'var(--pw-fg)' }}>
              {review.rankImpact.points} points
            </p>
            {review.rankImpact.average != null && (
              <p className="mt-1 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
                FPL average: {review.rankImpact.average}
                {review.rankImpact.vsAverage != null && (
                  <span style={{ color: review.rankImpact.vsAverage >= 0 ? 'var(--pw-up)' : 'var(--pw-negative)' }}>
                    {' '}
                    ({review.rankImpact.vsAverage >= 0 ? '+' : ''}
                    {review.rankImpact.vsAverage} vs average)
                  </span>
                )}
              </p>
            )}
            <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
              Overall rank: <span style={{ color: 'var(--pw-fg)' }}>{review.rankImpact.overallRank.toLocaleString()}</span>
              {review.rankImpact.topPercent != null && ` · Top ${review.rankImpact.topPercent}%`}
            </p>
          </div>

          <RankImpactCard gameweek={review.gameweek} rankImpact={review.rankImpact} />

          <DecisionHighlights best={review.bestDecision} miss={review.biggestMiss} />

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pw-fg-muted)' }}>
              Your management — tap for details
            </p>
            <QuickManagementSummary
              review={review}
              expanded={expandedTile}
              onToggle={(key) => setExpandedTile((cur) => (cur === key ? null : key))}
            />
          </div>

          {expandedTile === 'transfers' && <TransferImpactCard transferImpact={review.transferImpact} />}
          {expandedTile === 'captaincy' && <CaptaincyCard captaincy={review.captaincy} />}
          {expandedTile === 'lineup' && <LineupEfficiencyCard lineup={review.lineupEfficiency} />}
          {expandedTile === 'differentials' && <DifferentialImpactCard differential={review.differentialImpact} />}
        </>
      )}
    </div>
  );
}
