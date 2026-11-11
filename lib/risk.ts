import { getPlace, hazards } from "./data";
import type {
  Accommodation,
  Activity,
  Hazard,
  Month,
  Severity,
  Stop,
  Transport,
  TripAnswers,
} from "./types";

/** The parts of a trip that decide which hazards matter. */
export interface HazardContext {
  transport: Transport[];
  activities: Activity[];
  accommodation: Accommodation | null;
}

export function contextFromTrip(trip: TripAnswers): HazardContext {
  return {
    transport: trip.transport,
    activities: trip.activities,
    accommodation: trip.accommodation,
  };
}

export const emptyContext: HazardContext = {
  transport: [],
  activities: [],
  accommodation: null,
};

export function isCamping(ctx: HazardContext): boolean {
  return ctx.accommodation === "camp" || ctx.accommodation === "campervan";
}

/** True when this hazard counts for more because of how you sleep. */
export function isBoosted(h: Hazard, ctx: HazardContext): boolean {
  return !!h.campingBoost && isCamping(ctx);
}

/** Severity plus one extra point for camping hazards when you camp. */
export function hazardWeight(h: Hazard, ctx: HazardContext): number {
  return h.severity + (isBoosted(h, ctx) ? 1 : 0);
}

export type HazardStatus = "active" | "off-season" | "not-relevant";

/**
 * Decides how a hazard applies to a trip.
 * Unanswered questions never hide anything: skipping a question means "unknown".
 */
export function hazardStatus(
  h: Hazard,
  month: Month,
  ctx: HazardContext,
): HazardStatus {
  if (!h.months.includes(month)) return "off-season";

  // Road hazards only matter if you drive yourself.
  if (
    h.transports &&
    ctx.transport.length > 0 &&
    !h.transports.some((t) => ctx.transport.includes(t))
  ) {
    return "not-relevant";
  }

  // Activity hazards depend on what you plan to do. Camping keeps them visible.
  if (
    h.activities &&
    ctx.activities.length > 0 &&
    !h.activities.some((a) => ctx.activities.includes(a)) &&
    !isBoosted(h, ctx)
  ) {
    return "not-relevant";
  }

  return "active";
}

function bySeverity(ctx: HazardContext) {
  return (a: Hazard, b: Hazard) =>
    hazardWeight(b, ctx) - hazardWeight(a, ctx) || b.severity - a.severity;
}

export interface PlaceHazards {
  active: Hazard[];
  offSeason: Hazard[];
  notRelevant: Hazard[];
}

/** Everything known about a place, split by how it applies to this trip. */
export function placeHazardGroups(
  placeId: string,
  month: Month,
  ctx: HazardContext,
): PlaceHazards {
  const result: PlaceHazards = { active: [], offSeason: [], notRelevant: [] };
  for (const h of hazards) {
    if (!h.placeIds.includes(placeId)) continue;
    const status = hazardStatus(h, month, ctx);
    if (status === "active") result.active.push(h);
    else if (status === "off-season") result.offSeason.push(h);
    else result.notRelevant.push(h);
  }
  result.active.sort(bySeverity(ctx));
  return result;
}

/** Hazards that apply to a place in a given month for this trip, most important first. */
export function hazardsForPlace(
  placeId: string,
  month: Month,
  ctx: HazardContext,
): Hazard[] {
  return placeHazardGroups(placeId, month, ctx).active;
}

export function stopPlaceId(stop: Stop): string | null {
  return stop.kind === "place" ? stop.placeId : null;
}

export function stopName(stop: Stop): string {
  if (stop.kind === "custom") return stop.label;
  return getPlace(stop.placeId)?.name ?? "Unknown place";
}

export function stopCoords(stop: Stop): [number, number] {
  if (stop.kind === "custom") return [stop.lng, stop.lat];
  const place = getPlace(stop.placeId);
  return place ? [place.lng, place.lat] : [0, 0];
}

export function stopHazards(
  stop: Stop,
  month: Month,
  ctx: HazardContext,
): Hazard[] {
  const id = stopPlaceId(stop);
  return id ? hazardsForPlace(id, month, ctx) : [];
}

export function maxSeverity(list: Hazard[]): Severity | 0 {
  return list.reduce<Severity | 0>(
    (max, h) => (h.severity > max ? h.severity : max),
    0,
  );
}

/** Hazards at either end of a leg, merged. */
export function legHazards(
  a: Stop,
  b: Stop,
  month: Month,
  ctx: HazardContext,
): Hazard[] {
  const merged = new Map<string, Hazard>();
  for (const h of [
    ...stopHazards(a, month, ctx),
    ...stopHazards(b, month, ctx),
  ]) {
    merged.set(h.id, h);
  }
  return [...merged.values()].sort(bySeverity(ctx));
}

export interface RouteRisk {
  /** 0 (nothing known) to 3 (high). */
  level: Severity | 0;
  /** 0-100 used for the progress ring. */
  score: number;
  hazardCount: number;
  highCount: number;
  boostedCount: number;
}

/**
 * Route risk, in plain words:
 * - Take every distinct hazard active at any stop in the chosen month,
 *   after your trip answers have filtered out what does not apply to you.
 * - Each hazard adds its severity (1, 2 or 3) to a total.
 *   Camping hazards add 1 extra point if you sleep in a campsite, tent or campervan.
 * - The score compares that total with a busy trip (30 points), capped at 100.
 * - The level is the highest severity found, so one high hazard always shows as High.
 * A route with a single stop works the same way: there are just no legs.
 */
export function routeRisk(
  stops: Stop[],
  month: Month,
  ctx: HazardContext,
): RouteRisk {
  const unique = new Map<string, Hazard>();
  for (const stop of stops) {
    for (const h of stopHazards(stop, month, ctx)) unique.set(h.id, h);
  }
  const list = [...unique.values()];
  const total = list.reduce((sum, h) => sum + hazardWeight(h, ctx), 0);
  return {
    level: maxSeverity(list),
    score: Math.min(100, Math.round((total / 30) * 100)),
    hazardCount: list.length,
    highCount: list.filter((h) => h.severity === 3).length,
    boostedCount: list.filter((h) => isBoosted(h, ctx)).length,
  };
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function routeDistanceKm(stops: Stop[]): number {
  let total = 0;
  for (let i = 1; i < stops.length; i++) {
    total += distanceKm(stopCoords(stops[i - 1]), stopCoords(stops[i]));
  }
  return Math.round(total);
}
