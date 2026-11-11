import hazardsJson from "@/data/hazards.json";
import placesJson from "@/data/places.json";
import type { Hazard, Month, Place } from "./types";

export const hazards = hazardsJson as Hazard[];
export const places = placesJson as Place[];

const placeIndex = new Map(places.map((p) => [p.id, p]));

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
