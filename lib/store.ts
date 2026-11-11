"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Activity, Month, Stop, Transport, TripAnswers } from "./types";

interface TripState {
  trip: TripAnswers;
  stops: Stop[];
  /** Month used for hazard filtering. Starts from the onboarding answer. */
  month: Month;
  setTrip: (patch: Partial<TripAnswers>) => void;
  toggleActivity: (a: Activity) => void;
  toggleTransport: (t: Transport) => void;
  setMonth: (m: Month) => void;
  addPlace: (placeId: string) => void;
  addCustom: (lat: number, lng: number) => void;
  removeStop: (id: string) => void;
  moveStop: (id: string, dir: -1 | 1) => void;
  reset: () => void;
}

const emptyTrip: TripAnswers = {
  month: null,
  duration: null,
  transport: [],
  accommodation: null,
  party: null,
  activities: [],
  firstTime: null,
};

const uid = () => Math.random().toString(36).slice(2, 9);

export const useTrip = create<TripState>()(
  persist(
    (set) => ({
      trip: emptyTrip,
      stops: [],
      month: (new Date().getMonth() + 1) as Month,
      setTrip: (patch) =>
        set((s) => {
          const trip = { ...s.trip, ...patch };
          return { trip, month: trip.month ?? s.month };
        }),
      toggleActivity: (a) =>
        set((s) => ({
          trip: {
            ...s.trip,
            activities: s.trip.activities.includes(a)
              ? s.trip.activities.filter((x) => x !== a)
              : [...s.trip.activities, a],
          },
        })),
      // "Staying in one place" excludes the other options, and vice versa.
      toggleTransport: (t) =>
        set((s) => {
          const has = s.trip.transport.includes(t);
          let next: Transport[];
          if (has) next = s.trip.transport.filter((x) => x !== t);
          else if (t === "stay") next = ["stay"];
          else next = [...s.trip.transport.filter((x) => x !== "stay"), t];
          return { trip: { ...s.trip, transport: next } };
        }),
      setMonth: (m) => set({ month: m }),
      addPlace: (placeId) =>
        set((s) => ({
          stops: [...s.stops, { id: uid(), kind: "place", placeId }],
        })),
      addCustom: (lat, lng) =>
        set((s) => {
          const n = s.stops.filter((x) => x.kind === "custom").length + 1;
          return {
            stops: [
              ...s.stops,
              { id: uid(), kind: "custom", lat, lng, label: `Custom stop ${n}` },
            ],
          };
        }),
      removeStop: (id) =>
        set((s) => ({ stops: s.stops.filter((x) => x.id !== id) })),
      moveStop: (id, dir) =>
        set((s) => {
          const i = s.stops.findIndex((x) => x.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= s.stops.length) return s;
          const stops = [...s.stops];
          [stops[i], stops[j]] = [stops[j], stops[i]];
          return { stops };
        }),
      reset: () => set({ trip: emptyTrip, stops: [] }),
    }),
    {
      name: "outback-safe-trip",
      version: 2,
      // v1 stored a single transport string and had no accommodation.
      migrate: (persisted) => {
        const state = persisted as {
          trip?: Record<string, unknown> & { transport?: unknown };
        };
        if (state?.trip) {
          const t = state.trip.transport;
          state.trip.transport = Array.isArray(t) ? t : t ? [t] : [];
          state.trip.accommodation ??= null;
        }
        return state as unknown as TripState;
      },
    },
  ),
);
