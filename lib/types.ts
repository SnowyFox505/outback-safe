export type Severity = 1 | 2 | 3;

export type HazardCategory =
  | "wildlife"
  | "weather"
  | "terrain-water"
  | "road"
  | "health";

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Transport =
  | "car"
  | "campervan"
  | "4wd"
  | "bus"
  | "flights"
  | "stay";

export type Accommodation = "hotel" | "campervan" | "camp";

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
  /** Counts for more when you sleep in a campsite, tent or campervan. */
  campingBoost?: boolean;
}

export type PlaceKind =
  | "city"
  | "park"
  | "region"
  | "reef"
  | "coast"
  | "trail"
  | "sight";

export type Party = "solo" | "couple" | "friends" | "family";

export interface TrailInfo {
  /** Name of the walk, if it differs from the place. */
  name?: string;
  distanceKm?: number;
  /** As given by the source, e.g. "3 hours 30 minutes". */
  duration?: string;
  /** The source's own grade wording, e.g. "Grade 3". */
  grade?: string;
  shape?: "loop" | "return" | "one-way";
  /** Distance and duration are for one direction only. */
  eachWay?: boolean;
  /** Short caution, only if the source states one. */
  note?: string;
}

export interface PlaceImage {
  /** File under /public/places. */
  src: string;
  alt: string;
  credit: string;
  licence: string;
  /** Commons file page. */
  url: string;
}

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  state: string;
  lat: number;
  lng: number;
  description: string;
  funFacts: string[];
  /** Zoom level from which the pin shows on the map. Defaults to always. */
  minZoom?: number;
  /** A base city people can sleep in and use for day trips. */
  isBase?: boolean;
  /** Base this is a day trip from. */
  base?: string;
  /** Plain-text access note, e.g. "About 35 minutes' drive from Yulara". */
  access?: string;
  trail?: TrailInfo;
  /** Who it suits. Empty or missing means everyone. */
  suits?: Party[];
  /** A lesser-known tip. */
  secret?: boolean;
  tip?: string;
  /** Hazards of this place id apply here too. */
  inherits?: string;
  image?: PlaceImage;
  sources?: Source[];
}

export interface TripAnswers {
  /** The month currently used for hazards. */
  month: Month | null;
  /** Every month the traveller could go, to compare. */
  months: Month[];
  duration: string | null;
  /** Only for duration "longer". */
  durationWeeks: number | null;
  /** Optional start date (YYYY-MM-DD) for long trips. */
  startDate: string | null;
  transport: Transport[];
  accommodation: Accommodation | null;
  party: string | null;
  /** Base cities the traveller will sleep in. */
  bases: string[];
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
