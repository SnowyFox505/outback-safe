import hazardsJson from "@/data/hazards.json";
import placesJson from "@/data/places.json";
import type { Hazard, Month, Place } from "./types";

export const hazards = hazardsJson as Hazard[];
export const places = placesJson as Place[];

const placeIndex = new Map(places.map((p) => [p.id, p]));

/**
 * Day trips appear once the map shows roughly a quarter of the country, not the
 * whole of Australia. Pins that would crowd each other are thinned out in MapView.
 */
export const DETAIL_ZOOM = 4.6;

/** Zoom used when a day trip is opened, so close-by pins separate. */
export const DETAIL_FOCUS_ZOOM = 8;

export function pinMinZoom(p: Place): number {
  return p.minZoom ?? (p.base ? DETAIL_ZOOM : 0);
}

export function getPlace(id: string): Place | undefined {
  return placeIndex.get(id);
}

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const monthShort = monthNames.map((m) => m.slice(0, 3));

export function monthName(month: Month): string {
  return monthNames[month - 1];
}

export const categoryLabel: Record<Hazard["category"], string> = {
  wildlife: "Wildlife",
  weather: "Weather and climate",
  "terrain-water": "Terrain and water",
  road: "Road",
  health: "Health",
};
