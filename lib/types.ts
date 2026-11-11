export type Severity = 1 | 2 | 3;

export type HazardCategory =
  | "wildlife"
  | "weather"
  | "terrain-water"
  | "road"
  | "health";

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Transport = "car" | "campervan" | "4wd" | "bus" | "flights";

export type Activity =
  | "beach"
  | "snorkelling"
  | "hiking"
  | "parks"
  | "cities"
  | "outback";

export interface Source {
  name: string;
  url: string;
}

export interface Hazard {
  id: string;
  name: string;
  category: HazardCategory;
  severity: Severity;
  /** Months (1-12) in which this hazard is relevant. */
  months: Month[];
  /** Place ids this hazard applies to. */
  placeIds: string[];
  description: string;
  whatToDo: string;
  firstAid?: string;
  sources: Source[];
  /** Optional narrowing: only show when the trip uses one of these. */
  transports?: Transport[];
  activities?: Activity[];
}

export type PlaceKind = "city" | "park" | "region" | "reef" | "coast";

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  state: string;
  lat: number;
  lng: number;
  description: string;
  funFacts: string[];
}

export interface TripAnswers {
  month: Month | null;
  duration: string | null;
  transport: Transport | null;
  party: string | null;
  activities: Activity[];
  firstTime: boolean | null;
}

/** A stop is either a known place or a free point set on the map. */
export type Stop =
  | { id: string; kind: "place"; placeId: string }
  | { id: string; kind: "custom"; lat: number; lng: number; label: string };

export interface HazardMatch {
  hazard: Hazard;
}
