import { getPlace, places } from "./data";
import type { Party, Place, Stop, TrailInfo, TripAnswers } from "./types";

/** "10.6 km loop · 3 hours 30 minutes · Grade 3", using only what the source gave. */
export function trailLine(t: TrailInfo): string {
  const parts: string[] = [];
  const way = t.eachWay ? " each way" : "";
  if (t.distanceKm !== undefined) {
    const shape =
      t.shape === "loop" ? " loop" : t.shape === "return" && !t.eachWay ? " return" : "";
    parts.push(`${t.distanceKm} km${shape}${way}`);
  } else if (t.shape === "loop") {
    parts.push("Loop");
  }
  if (t.duration) parts.push(`${t.duration}${way}`);
  if (t.grade) parts.push(t.grade);
  return parts.join(" · ");
}

export const partyLabel: Record<Party, string> = {
  solo: "Solo travellers",
  couple: "Couples",
  friends: "Friends",
  family: "Families with kids",
};

function isParty(value: string | null): value is Party {
  return value === "solo" || value === "couple" || value === "friends" || value === "family";
}

/** Does this place name the traveller's group as a good fit? */
export function fitsParty(place: Place, party: string | null): boolean {
  return isParty(party) && !!place.suits?.includes(party);
}

export interface BaseIdeas {
  base: Place;
  ideas: Place[];
}

/**
 * Day trips and walks near each base the traveller picked.
 * Places that name the traveller's group as a good fit come first.
 * Places already on the route are left out.
 */
export function ideasNearBases(trip: TripAnswers, stops: Stop[]): BaseIdeas[] {
  const inRoute = new Set(
    stops.flatMap((s) => (s.kind === "place" ? [s.placeId] : [])),
  );
  const result: BaseIdeas[] = [];
  for (const baseId of trip.bases) {
    const base = getPlace(baseId);
    if (!base) continue;
    const ideas = places
      .filter((p) => p.base === baseId && !inRoute.has(p.id))
      .sort(
        (a, b) =>
          Number(fitsParty(b, trip.party)) - Number(fitsParty(a, trip.party)) ||
          a.name.localeCompare(b.name),
      );
    if (ideas.length > 0) result.push({ base, ideas });
  }
  return result;
}
