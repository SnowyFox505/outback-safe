import { getPlace, hazards } from "./data";
import type { Hazard, Month, Severity, Stop } from "./types";

/** Hazards that apply to a place in a given month, most severe first. */
export function hazardsForPlace(placeId: string, month: Month): Hazard[] {
  return hazards
    .filter((h) => h.placeIds.includes(placeId) && h.months.includes(month))
    .sort((a, b) => b.severity - a.severity);
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

export function stopHazards(stop: Stop, month: Month): Hazard[] {
  const id = stopPlaceId(stop);
  return id ? hazardsForPlace(id, month) : [];
}

export function maxSeverity(list: Hazard[]): Severity | 0 {
  return list.reduce<Severity | 0>(
    (max, h) => (h.severity > max ? h.severity : max),
    0,
  );
}

/** Hazards shared by both ends of a leg, plus any that apply at only one end. */
export function legHazards(a: Stop, b: Stop, month: Month): Hazard[] {
  const merged = new Map<string, Hazard>();
  for (const h of [...stopHazards(a, month), ...stopHazards(b, month)]) {
    merged.set(h.id, h);
  }
  return [...merged.values()].sort((x, y) => y.severity - x.severity);
}

export interface RouteRisk {
  /** 0 (nothing known) to 3 (high). */
  level: Severity | 0;
  /** 0-100 used for the progress ring. */
  score: number;
  hazardCount: number;
  highCount: number;
}

/**
 * Route risk, in plain words:
 * - Take every distinct hazard active at any stop in the chosen month.
 * - Each hazard adds its severity (1, 2 or 3) to a total.
 * - The score is that total compared with a busy trip (18 points), capped at 100.
 * - The level is the highest severity found, so one high hazard always shows as High.
 */
export function routeRisk(stops: Stop[], month: Month): RouteRisk {
  const unique = new Map<string, Hazard>();
  for (const stop of stops) {
    for (const h of stopHazards(stop, month)) unique.set(h.id, h);
  }
  const list = [...unique.values()];
  const total = list.reduce((sum, h) => sum + h.severity, 0);
  return {
    level: maxSeverity(list),
    score: Math.min(100, Math.round((total / 18) * 100)),
    hazardCount: list.length,
    highCount: list.filter((h) => h.severity === 3).length,
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
