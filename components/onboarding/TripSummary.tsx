"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { monthName } from "@/lib/data";
import { questions } from "@/lib/questions";
import type { TripAnswers } from "@/lib/types";

const seasonOf = (m: number) =>
  m === 12 || m <= 2
    ? "Summer"
    : m <= 5
      ? "Autumn"
      : m <= 8
        ? "Winter"
        : "Spring";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function labelFor(key: keyof TripAnswers, trip: TripAnswers): string | null {
  const q = questions.find((x) => x.key === key);
  if (!q) return null;
  const raw = trip[key];
  if (key === "months") {
    return trip.months.length
      ? trip.months.map((m) => monthName(m).slice(0, 3)).join(", ")
      : null;
  }
  if (key === "duration" && trip.duration === "longer") {
    const parts = ["Longer"];
    if (trip.durationWeeks) parts.push(`${trip.durationWeeks} weeks`);
    if (trip.startDate) parts.push(`from ${formatDate(trip.startDate)}`);
    return parts.join(" · ");
  }
  if (key === "activities" || key === "transport" || key === "bases") {
    const ids =
      key === "activities" ? trip.activities : key === "bases" ? trip.bases : trip.transport;
    if (ids.length === 0) return null;
    return ids
      .map((id) => q.options.find((o) => o.id === id)?.label ?? id)
      .join(", ");
  }
  if (key === "firstTime") {
    if (trip.firstTime === null) return null;
    return trip.firstTime ? "First time" : "Been before";
  }
  if (typeof raw !== "string") return null;
  const label = q.options.find((o) => o.id === raw)?.label ?? null;
  if (key === "party" && raw === "family" && trip.kids !== null) {
    return `${label} · ${trip.kids ? "with kids" : "without kids"}`;
  }
  return label;
}

const rows: { key: keyof TripAnswers; label: string }[] = [
  { key: "months", label: "When" },
  { key: "duration", label: "How long" },
  { key: "transport", label: "Getting around" },
  { key: "accommodation", label: "Sleeping" },
  { key: "bases", label: "Staying in" },
  { key: "party", label: "Who" },
  { key: "activities", label: "Plans" },
  { key: "firstTime", label: "Experience" },
];

const EASE = [0.22, 0.8, 0.28, 1] as const;
const UNFOLD_EASE = [0.2, 0.8, 0.2, 1] as const;

/** Seconds: when each fold starts, how long it takes, when the stamp lands. */
const FOLD_1_AT = 0.85;
const FOLD_2_AT = 1.65;
const FOLD_TIME = 1.0;
const FOLDED = 180;
const STAMP_AT = FOLD_2_AT + FOLD_TIME + 0.05;
/** The Continue button on the page waits for this. */
export const LETTER_DONE = STAMP_AT + 0.55;

const faceStyle = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
} as const;

/** The round "Outback Safe" stamp that lands on the letter at the end. */
function Stamp({ reduce }: { reduce: boolean }) {
  const id = useId();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 100"
      initial={reduce ? { opacity: 0.85 } : { opacity: 0, scale: 1.7, rotate: -26 }}
      animate={{ opacity: 0.88, scale: 1, rotate: -12 }}
      transition={{
        delay: STAMP_AT,
        type: "spring",
        stiffness: 380,
        damping: 17,
        opacity: { delay: STAMP_AT, duration: 0.12 },
      }}
      className="pointer-events-none absolute bottom-3 right-4 h-[84px] w-[84px] text-ochre"
    >
      <defs>
        <filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
        <path id={`${id}-ring`} d="M50,50 m-32,0 a32,32 0 1,1 64,0 a32,32 0 1,1 -64,0" />
      </defs>
      <g filter={`url(#${id}-ink)`} fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="46" strokeWidth="2.4" />
        <circle cx="50" cy="50" r="41" strokeWidth="0.9" />
        <circle cx="50" cy="50" r="22" strokeWidth="0.9" />
        <text
          fill="currentColor"
          stroke="none"
          fontSize="8.6"
          letterSpacing="2.1"
          fontFamily="var(--font-mono), monospace"
        >
          <textPath href={`#${id}-ring`} startOffset="2%">
            OUTBACK SAFE · TRIP PLAN ·
          </textPath>
        </text>
        <path d="M36 57 C 43 42, 55 66, 64 43" strokeWidth="1.6" strokeDasharray="2.6 3" strokeLinecap="round" />
        <circle cx="36" cy="57" r="2.6" fill="currentColor" stroke="none" />
        <circle cx="64" cy="43" r="2.6" fill="currentColor" stroke="none" />
      </g>
    </motion.svg>
  );
}

function Rows({
  items,
  trip,
  at,
  reduce,
}: {
  items: { key: keyof TripAnswers; label: string }[];
  trip: TripAnswers;
  at: number;
  reduce: boolean;
}) {
  return (
    <dl className="space-y-3.5 px-6 pb-6 pt-6">
      {items.map(({ key, label }, i) => {
        const value = labelFor(key, trip);
        return (
          <motion.div
            key={key}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: at + i * 0.07, duration: 0.35, ease: EASE }}
            className="flex items-baseline justify-between gap-6"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
              {label}
            </dt>
            <dd className={`text-right text-[15px] ${value ? "text-bone" : "text-bone-faint"}`}>
              {value ?? "Skipped"}
            </dd>
          </motion.div>
        );
      })}
    </dl>
  );
}

/**
 * "Your trip at a glance" as a tri-fold letter. Two dashed folds split it into
 * three panels. The lower two start folded behind the first and swing open in 3D
 * one after the other, with light and shadow following the angle. An ochre stamp
 * lands at the end.
 */
export function TripSummary({ trip }: { trip: TripAnswers }) {
  const reduce = !!useReducedMotion();
  const months = trip.months;
  const single = months.length === 1 ? months[0] : null;

  // Fold angles in degrees. The panels start folded flat behind the one above
  // (180) and swing out towards the viewer until they lie flat at 0.
  const a2 = useMotionValue(reduce ? 0 : FOLDED);
  const a3 = useMotionValue(reduce ? 0 : FOLDED);
  const shade2 = useTransform(a2, [180, 90, 0], [0.5, 0.16, 0]);
  // Panels stay invisible while they are tucked away, so no corners peek out.
  const live2 = useTransform(a2, [180, 172], [0, 1]);
  const live3 = useTransform(a3, [180, 172], [0, 1]);
  // A folded last panel shows blank paper; its text appears as it opens.
  const cover3 = useTransform(a3, [150, 95], [1, 0]);
  const shade3 = useTransform(a3, [180, 90, 0], [0.5, 0.16, 0]);
  const shadow = useTransform(
    [a2, a3],
    ([x, y]: number[]) =>
      0.34 + 0.33 * (1 - x / 180) + 0.33 * (1 - y / 180),
  );
  const shadowOpacity = useTransform(
    [a2, a3],
    ([x, y]: number[]) =>
      0.25 + 0.35 * ((2 - x / 180 - y / 180) / 2),
  );

  useEffect(() => {
    if (reduce) return;
    const c2 = animate(a2, 0, { delay: FOLD_1_AT, duration: FOLD_TIME, ease: UNFOLD_EASE });
    const c3 = animate(a3, 0, { delay: FOLD_2_AT, duration: FOLD_TIME, ease: UNFOLD_EASE });
    return () => {
      c2.stop();
      c3.stop();
    };
  }, [a2, a3, reduce]);

  // Panels 2 and 3 hang below the layout, so reserve their height.
  const midRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<HTMLDivElement>(null);
  const [reserve, setReserve] = useState(0);
  useLayoutEffect(() => {
    const mid = midRef.current;
    const last = lastRef.current;
    if (!mid || !last) return;
    const measure = () => setReserve(mid.offsetHeight + last.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(mid);
    ro.observe(last);
    return () => ro.disconnect();
  }, []);

  const secondPanel = rows.slice(1, 4);
  const thirdPanel = rows.slice(4);

  return (
    <div style={{ perspective: 2200 }}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, rotateX: 16 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "50% 0%",
          paddingBottom: reserve,
        }}
        className="relative"
      >
        {/* Soft shadow on the table that grows as the letter opens. */}
        <motion.div
          aria-hidden
          style={{
            scaleY: shadow,
            opacity: shadowOpacity,
            transformOrigin: "top",
          }}
          className="pointer-events-none absolute inset-x-3 -bottom-4 top-6 rounded-[28px] bg-black blur-2xl"
        />

        {/* Panel 1: month and season, always visible. */}
        <div style={{ transformStyle: "preserve-3d" }} className="relative">
          <div
            style={{ transform: "translateZ(8px)" }}
            className="paper relative rounded-t-[28px] border border-b-0 border-bone/[0.08] px-6 pb-5 pt-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre">
              Your trip
            </p>
            <p className="mt-1 font-display text-[34px] font-semibold leading-none text-bone">
              {single
                ? monthName(single)
                : months.length > 1
                  ? `${months.length} possible months`
                  : "Month not set"}
            </p>
            {months.length > 0 && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
                {single
                  ? `${seasonOf(single)} in Australia`
                  : months.map((m) => monthName(m).slice(0, 3)).join(" · ")}
              </p>
            )}
            <motion.span
              aria-hidden
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
              style={{ transformOrigin: "left" }}
              className="absolute inset-x-0 bottom-0 border-t border-dashed border-bone/20"
            />
          </div>

          {/* Panel 2: hinged to the bottom of panel 1. */}
          <motion.div
            ref={midRef}
            style={{
              rotateX: a2,
              transformStyle: "preserve-3d",
              transformOrigin: "50% 0%",
            }}
            className="absolute inset-x-0 top-full"
          >
            <motion.div
              style={{ ...faceStyle, opacity: live2 }}
              className="paper relative border-x border-bone/[0.08]"
            >
              <Rows items={secondPanel} trip={trip} at={FOLD_1_AT + 0.55} reduce={reduce} />
              <motion.span
                aria-hidden
                style={{ opacity: shade2 }}
                className="pointer-events-none absolute inset-0 bg-bone"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 border-t border-dashed border-bone/20"
              />
            </motion.div>
            <motion.div
              aria-hidden
              style={{ ...faceStyle, transform: "rotateX(180deg)", opacity: live2 }}
              className="paper paper-back absolute inset-0 border-x border-bone/[0.08]"
            />

            {/* Panel 3: hinged to the bottom of panel 2. */}
            <motion.div
              ref={lastRef}
              style={{
                rotateX: a3,
                transformStyle: "preserve-3d",
                transformOrigin: "50% 0%",
              }}
              className="absolute inset-x-0 top-full"
            >
              <motion.div
                style={{ ...faceStyle, opacity: live3 }}
                className="paper relative rounded-b-[28px] border border-t-0 border-bone/[0.08]"
              >
                <Rows items={thirdPanel} trip={trip} at={FOLD_2_AT + 0.55} reduce={reduce} />
                <div className="h-[72px]" />
                <Stamp reduce={reduce} />
                <motion.span
                  aria-hidden
                  style={{ opacity: cover3 }}
                  className="paper paper-back pointer-events-none absolute inset-0 rounded-b-[28px]"
                />
                <motion.span
                  aria-hidden
                  style={{ opacity: shade3 }}
                  className="pointer-events-none absolute inset-0 rounded-b-[28px] bg-bone"
                />
              </motion.div>
              <motion.div
                aria-hidden
                style={{ ...faceStyle, transform: "rotateX(180deg)", opacity: live3 }}
                className="paper paper-back absolute inset-0 rounded-b-[28px] border-x border-bone/[0.08]"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
