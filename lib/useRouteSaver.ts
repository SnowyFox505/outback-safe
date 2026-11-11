"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { defaultRouteName, saveRoute } from "./routes";
import { useTrip } from "./store";

export type SaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1500;

/**
 * Saves the current plan to Firestore.
 * With auto-save on, every change is saved after a short pause. A route that was
 * just loaded from "My routes" is treated as already saved until you change it.
 */
export function useRouteSaver() {
  const { status, user } = useAuth();
  const trip = useTrip((s) => s.trip);
  const stops = useTrip((s) => s.stops);
  const month = useTrip((s) => s.month);
  const routeId = useTrip((s) => s.routeId);
  const setRouteId = useTrip((s) => s.setRouteId);
  const autoSave = useTrip((s) => s.autoSave);

  const [state, setState] = useState<SaveState>("idle");
  const [tick, setTick] = useState(0);
  const lastSaved = useRef<string | null>(null);
  const saving = useRef(false);

  const signature = JSON.stringify({ stops, month, trip });
  const canSave = status === "signedIn" && !!user && stops.length > 0;

  const saveNow = useCallback(async () => {
    if (!canSave || !user || saving.current) return;
    saving.current = true;
    setState("saving");
    const sentSignature = signature;
    try {
      const id = await saveRoute({
        uid: user.uid,
        routeId,
        name: defaultRouteName(stops, month),
        month,
        trip,
        stops,
      });
      setRouteId(id);
      lastSaved.current = sentSignature;
      setState("saved");
    } catch {
      setState("error");
    } finally {
      saving.current = false;
      // If the plan changed while saving, run the effect again.
      setTick((t) => t + 1);
    }
  }, [canSave, user, signature, routeId, stops, month, trip, setRouteId]);

  useEffect(() => {
    if (!autoSave || !canSave) return;
    // A loaded route starts out saved.
    if (lastSaved.current === null && routeId) {
      lastSaved.current = signature;
      return;
    }
    if (lastSaved.current === signature) return;
    if (state === "error") return; // wait for the next change or a manual retry
    const timer = window.setTimeout(() => void saveNow(), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoSave, canSave, routeId, signature, tick, state, saveNow]);

  // A new edit after an error clears it so auto-save can try again.
  useEffect(() => {
    if (state === "error") {
      const t = window.setTimeout(() => setState("idle"), 8000);
      return () => window.clearTimeout(t);
    }
  }, [state]);

  return { state, saveNow, autoSave, canSave, signedIn: status === "signedIn", routeId };
}
