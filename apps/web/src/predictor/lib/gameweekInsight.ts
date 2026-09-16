import type { GameweekReview } from '../hooks/useFplProfile';

/**
 * Picks the single most interesting headline from a Gameweek Review.
 * Differential Impact isn't wired in yet (needs the ownership-snapshot
 * cron, phase (d)) — add it as a candidate here once it lands. Always
 * returns something constructive, even on a rough week.
 */
export function pickHeadlineInsight(review: GameweekReview): string {
  const { rankImpact, transferImpact, captaincy, lineupEfficiency, differentialImpact } = review;
  const bestTransfer = transferImpact.pairs.length
    ? transferImpact.pairs.reduce((best, p) => (p.gain > best.gain ? p : best))
    : null;

  const candidates: Array<{ magnitude: number; text: string }> = [];

  if (bestTransfer && bestTransfer.gain > 0 && bestTransfer.playerIn) {
    candidates.push({ magnitude: bestTransfer.gain, text: `🧠 Your ${bestTransfer.playerIn.webName} transfer gained you ${bestTransfer.gain} points` });
  }
  if (differentialImpact.biggestBoost) {
    candidates.push({ magnitude: differentialImpact.biggestBoost.points, text: `💎 Your differential delivered ${differentialImpact.biggestBoost.points} points` });
  }
  if (captaincy.captain && captaincy.efficiency === 100 && !captaincy.captainDidNotPlay) {
    candidates.push({ magnitude: captaincy.captain.points, text: `🎯 Your captain was the best choice in your XI` });
  }
  if (lineupEfficiency.missedPoints != null && lineupEfficiency.missedPoints >= 5) {
    candidates.push({ magnitude: lineupEfficiency.missedPoints, text: `😬 You left ${lineupEfficiency.missedPoints} potential points on the bench` });
  }
  if (rankImpact.topPercent != null && rankImpact.topPercent <= 5) {
    candidates.push({ magnitude: 15, text: `👑 You had a very strong gameweek relative to the field` });
  }
  if (rankImpact.vsAverage != null && rankImpact.vsAverage > 0) {
    candidates.push({ magnitude: rankImpact.vsAverage, text: `🔥 You beat the FPL average by ${rankImpact.vsAverage} points` });
  }
  if (rankImpact.rankMovement != null && rankImpact.rankMovement > 0) {
    candidates.push({ magnitude: rankImpact.rankMovement / 20_000, text: `🚀 You climbed ${rankImpact.rankMovement.toLocaleString()} places` });
  }

  if (candidates.length > 0) {
    return candidates.sort((a, b) => b.magnitude - a.magnitude)[0].text;
  }

  // Nothing stood out positively — still constructive, not discouraging.
  if (rankImpact.vsAverage != null && rankImpact.vsAverage < 0) {
    return `A tougher gameweek than most — ${Math.abs(rankImpact.vsAverage)} points below average. Full review inside.`;
  }
  return `GW${review.gameweek} is in the books — see how it broke down.`;
}

/** The "best standout decision" line — picks across transfer/captaincy, whichever mattered most. */
export function pickStandoutMove(review: GameweekReview): string | null {
  const { transferImpact, captaincy } = review;
  const bestTransfer = transferImpact.pairs.length
    ? transferImpact.pairs.reduce((b, p) => (p.gain > b.gain ? p : b))
    : null;

  const candidates: Array<{ magnitude: number; text: string }> = [];
  if (bestTransfer && bestTransfer.gain > 0 && bestTransfer.playerIn) {
    candidates.push({ magnitude: bestTransfer.gain, text: `Best move: ${bestTransfer.playerIn.webName} transfer +${bestTransfer.gain}` });
  }
  if (captaincy.captain && captaincy.efficiency === 100 && !captaincy.captainDidNotPlay) {
    candidates.push({ magnitude: captaincy.captain.points, text: `Best move: Captaining ${captaincy.captain.webName}` });
  }

  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b.magnitude - a.magnitude)[0].text;
}
