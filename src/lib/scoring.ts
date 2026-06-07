/**
 * Single source of truth for the prode scoring rules:
 *  - Resultado exacto:                    6 puntos
 *  - Acertás el ganador (o el empate)
 *    sin el resultado exacto:             3 puntos
 *  - Cualquier otro caso:                 0 puntos
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

  if (exactMatch) return 6;

  const sameOutcome =
    matchOutcome(realHomeScore, realAwayScore) ===
    matchOutcome(predictedHomeScore, predictedAwayScore);

  if (sameOutcome) return 3;

  return 0;
}
