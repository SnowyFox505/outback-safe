import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { monthShort } from "./data";
import { routeDistanceKm, stopName } from "./risk";
import type { Month, Stop, TripAnswers } from "./types";

/** A route as stored at users/{uid}/routes/{routeId}. */
export interface SavedRoute {
  id: string;
  name: string;
  month: Month;
  trip: TripAnswers;
  stops: Stop[];
  updatedAt: Date | null;
}

function routesCollection(uid: string) {
  return collection(getDb(), "users", uid, "routes");
}

/** Firestore rejects undefined values, so round-trip through JSON. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function defaultRouteName(stops: Stop[], month: Month): string {
  const when = monthShort[month - 1];
  if (stops.length === 0) return `New route · ${when}`;
  if (stops.length === 1) return `${stopName(stops[0])} · ${when}`;
  return `${stopName(stops[0])} to ${stopName(stops[stops.length - 1])} · ${when}`;
}

export function routeSummary(route: Pick<SavedRoute, "stops" | "month">): string {
  const n = route.stops.length;
  const km = routeDistanceKm(route.stops);
  const parts = [monthShort[route.month - 1], `${n} stop${n === 1 ? "" : "s"}`];
  if (n > 1) parts.push(`${km.toLocaleString("en-AU")} km`);
  return parts.join(" · ");
}

/** Live list of the user's routes, newest first. Returns an unsubscribe function. */
export function subscribeRoutes(
  uid: string,
  onChange: (routes: SavedRoute[]) => void,
  onError: (message: string) => void,
): () => void {
  const q = query(routesCollection(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data({ serverTimestamps: "estimate" });
          return {
            id: d.id,
            name: String(data.name ?? "Untitled route"),
            month: data.month as Month,
            trip: data.trip as TripAnswers,
            stops: (data.stops ?? []) as Stop[],
            updatedAt: data.updatedAt?.toDate?.() ?? null,
          };
        }),
      );
    },
    () => onError("Could not load your routes. Check your connection."),
  );
}

interface SaveInput {
  uid: string;
  routeId: string | null;
  name: string;
  month: Month;
  trip: TripAnswers;
  stops: Stop[];
}

/** Creates a route, or updates it when routeId is set. Returns the route id. */
export async function saveRoute(input: SaveInput): Promise<string> {
  const payload = clean({
    month: input.month,
    trip: input.trip,
    stops: input.stops,
  });
  if (input.routeId) {
    // Updating keeps the current name, because the user may have renamed it.
    await updateDoc(doc(routesCollection(input.uid), input.routeId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    return input.routeId;
  }
  const ref = await addDoc(routesCollection(input.uid), {
    name: input.name,
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function renameRoute(
  uid: string,
  routeId: string,
  name: string,
): Promise<void> {
  await updateDoc(doc(routesCollection(uid), routeId), {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRoute(uid: string, routeId: string): Promise<void> {
  await deleteDoc(doc(routesCollection(uid), routeId));
}
