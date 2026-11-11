import { routeRisk } from "./risk";
import type { HazardContext, RouteRisk } from "./risk";
import type { Month, Stop } from "./types";

export interface MonthScore {
  month: Month;
  risk: RouteRisk;
}

/** Route risk for each candidate month, in calendar order. */
export function compareMonths(
  stops: Stop[],
  months: Month[],
  ctx: HazardContext,
): MonthScore[] {
  return [...months]
    .sort((a, b) => a - b)
    .map((month) => ({ month, risk: routeRisk(stops, month, ctx) }));
}

/**
 * The calmest month: lowest score, then fewer high hazards, then fewer hazards.
 * Returns null when there is nothing to compare (no stops, or only one month).
 */
export function bestMonth(scores: MonthScore[], hasStops: boolean): Month | null {
  if (!hasStops || scores.length < 2) return null;
  const sorted = [...scores].sort(
    (a, b) =>
      a.risk.score - b.risk.score ||
      a.risk.highCount - b.risk.highCount ||
      a.risk.hazardCount - b.risk.hazardCount,
  );
  const best = sorted[0];
  const next = sorted[1];
  // If the best two are identical there is no real winner.
  if (
    best.risk.score === next.risk.score &&
    best.risk.highCount === next.risk.highCount &&
    best.risk.hazardCount === next.risk.hazardCount
  ) {
    return null;
  }
  return best.month;
}
