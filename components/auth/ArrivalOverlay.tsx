"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LoginScene } from "./LoginScene";

/** Seconds: when the welcome overlay starts to lift, and how long that takes. */
const LIFT_AT = 1.05;
const LIFT_TIME = 0.55;
/** Home waits this long before it rises into place (see --rise-wait in globals.css). */
export const ARRIVAL_WAIT = LIFT_AT;

interface ArrivalOverlayProps {
  kind: "signin" | "signup";
  /** First name, if we have one. */
  name?: string | null;
  onDone: () => void;
}

/**
 * Plays right after signing in or registering. The camera dives down through
 * the layers of the relief the login screen showed, a welcome line appears, and
 * the overlay lifts to reveal Home. About 1.6 seconds in total.
 */
export function ArrivalOverlay({ kind, name, onDone }: ArrivalOverlayProps) {
  const reduce = !!useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(onDone, (reduce ? 0.7 : LIFT_AT + LIFT_TIME) * 1000 + 60);
    return () => window.clearTimeout(t);
  }, [onDone, reduce]);

  const first = name?.trim().split(" ")[0];
  const lead = kind === "signup" ? "Welcome to" : "Welcome back";
  const headline = kind === "signup" ? "Outback Safe" : (first ?? "Outback Safe");

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[90] bg-ink"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{
        delay: reduce ? 0.35 : LIFT_AT,
        duration: reduce ? 0.3 : LIFT_TIME,
        ease: [0.4, 0, 0.6, 1],
      }}
      style={{ pointerEvents: "auto" }}
    >
      {!reduce && <LoginScene dive />}

      <div className="absolute inset-0 grid place-items-center px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: reduce ? 0 : 0.35, duration: 0.55, ease: [0.22, 0.8, 0.28, 1] }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ochre">{lead}</p>
          <p className="mt-3 font-display text-[40px] font-semibold leading-none tracking-tight text-bone">
            {headline}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
