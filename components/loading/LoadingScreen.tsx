"use client";

import { useEffect, useRef, useState } from "react";
import { AUSTRALIA_PATHS, AUSTRALIA_VIEWBOX } from "./australiaOutline";

/** The loading screen always stays at least this long, even if the app is ready sooner. */
const MIN_MS = 3000;
const FADE_MS = 450;
/**
 * When the app was out of sight for longer than this, the intro plays again on
 * return, even if the app was never fully closed. A short switch away does not.
 */
const AWAY_MS = 90_000;

/**
 * Full-screen intro: the outline of Australia draws itself in ochre and rust.
 * Shown on every cold start for at least three seconds, and again when the app
 * comes back after being away for more than 90 seconds.
 */
export function LoadingScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");
  // Counts the plays, so a replay restarts the drawing animation from the start.
  const [run, setRun] = useState(0);
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Replay after a longer absence (the page stays alive in the background on phones).
  useEffect(() => {
    let hiddenAt: number | null = null;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      if (away > AWAY_MS && phaseRef.current === "gone") {
        setPhase("show");
        setRun((r) => r + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const started = performance.now();
    let fadeTimer: number | undefined;
    let goneTimer: number | undefined;
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      fadeTimer = window.setTimeout(() => {
        setPhase("fade");
        goneTimer = window.setTimeout(() => setPhase("gone"), FADE_MS);
      }, wait);
    };

    // Wait for the page to finish loading, but never less than the minimum time.
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", finish);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(goneTimer);
    };
  }, [run]);

  if (phase === "gone") return null;

  return (
    <div
      key={run}
      role="status"
      aria-live="polite"
      aria-label="Loading Outback Safe"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink px-8 transition-opacity ease-out"
      style={{
        opacity: phase === "fade" ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      <svg
        viewBox={AUSTRALIA_VIEWBOX}
        className="loading-outline w-[min(78vw,360px)] overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="outline-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e3b25a" />
            <stop offset="55%" stopColor="#d9a441" />
            <stop offset="100%" stopColor="#b5502d" />
          </linearGradient>
        </defs>
        {AUSTRALIA_PATHS.map((d, i) => (
          <g key={i}>
            <path d={d} className="loading-outline-fill" />
            <path d={d} className="loading-outline-base" />
            <path
              d={d}
              pathLength={1}
              className="loading-outline-line"
              stroke="url(#outline-gradient)"
            />
          </g>
        ))}
      </svg>

      <p className="mt-10 font-display text-[28px] font-semibold leading-none text-bone">
        Outback Safe
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-bone-faint">
        Loading
      </p>
    </div>
  );
}
