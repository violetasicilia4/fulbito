/**
 * Single source of truth for the prode scoring rules:
 *  - Exact score:            3 points
 *  - Correct outcome only
 *    (win / draw / loss):    1 point
 *  - Anything else:          0 points
 *
 * Used both by the manual results admin flow and (later) by any
 * automated results-sync job, so the rules only live in one place.
 */

export type MatchOutcome = "home" | "away" | "draw";

export function matchOutcome(homeScore: number, awayScore: number): MatchOutcome {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}

export function calculatePoints(
  realHomeScore: number,
  realAwayScore: number,
  predictedHomeScore: number,
  predictedAwayScore: number,
): number {
  const exactMatch =
    realHomeScore === predictedHomeScore && realAwayScore === predictedAwayScore;

  if (exactMatch) return 3;

  const sameOutcome =
    matchOutcome(realHomeScore, realAwayScore) ===
    matchOutcome(predictedHomeScore, predictedAwayScore);

  return sameOutcome ? 1 : 0;
}
