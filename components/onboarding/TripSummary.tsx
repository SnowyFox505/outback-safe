"use client";

import { motion } from "motion/react";
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
  return q.options.find((o) => o.id === raw)?.label ?? null;
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

/** When the lower half starts to unfold, in seconds. */
const UNFOLD_AT = 0.75;

const list = {
  hidden: {},
  show: { transition: { delayChildren: UNFOLD_AT + 0.6, staggerChildren: 0.07 } },
};
const row = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

/**
 * "Your trip at a glance", styled like a letter. The card settles in, a dashed
 * perforation draws across, then the lower half unfolds from it and the details
 * appear one by one.
 */
export function TripSummary({ trip }: { trip: TripAnswers }) {
  const months = trip.months;
  const single = months.length === 1 ? months[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, rotate: -0.8 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{ perspective: 1100 }}
    >
      {/* The folded letter: month and season on the front. */}
      <motion.div
        initial={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        animate={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        transition={{ delay: UNFOLD_AT, duration: 0.25 }}
        className="relative z-10 rounded-t-[28px] border border-b-0 border-bone/[0.08] bg-char-800 px-6 pb-5 pt-6"
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

        {/* Closed edge of the letter, replaced by the dashed fold. */}
        <motion.span
          aria-hidden
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: UNFOLD_AT - 0.1, duration: 0.2 }}
          className="absolute inset-x-0 bottom-0 h-px bg-bone/[0.08]"
        />
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.45, duration: 0.4, ease: EASE }}
          style={{ transformOrigin: "left" }}
          className="absolute inset-x-0 bottom-0 border-t border-dashed border-bone/20"
        />
      </motion.div>

      {/* The flap that unfolds downwards from the dashed line. */}
      <motion.div
        initial={{ rotateX: 90 }}
        animate={{ rotateX: 0 }}
        transition={{ delay: UNFOLD_AT, duration: 0.95, ease: [0.16, 0.9, 0.24, 1] }}
        style={{ transformOrigin: "top", backfaceVisibility: "hidden" }}
        className="relative rounded-b-[28px] border border-t-0 border-bone/[0.08] bg-char-800"
      >
        {/* Paper shading that lifts as the flap opens. */}
        <motion.span
          aria-hidden
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0 }}
          transition={{ delay: UNFOLD_AT, duration: 0.95, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-b-[28px] bg-black"
        />
        <motion.span
          aria-hidden
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: UNFOLD_AT + 0.35, type: "spring", stiffness: 420, damping: 22 }}
          className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-ink"
        />
        <motion.span
          aria-hidden
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: UNFOLD_AT + 0.35, type: "spring", stiffness: 420, damping: 22 }}
          className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-ink"
        />
        <motion.dl
          variants={list}
          initial="hidden"
          animate="show"
          className="space-y-3.5 px-6 pb-6 pt-6"
        >
          {rows.slice(1).map(({ key, label }) => {
            const value = labelFor(key, trip);
            return (
              <motion.div
                key={key}
                variants={row}
                className="flex items-baseline justify-between gap-6"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
                  {label}
                </dt>
                <dd
                  className={`text-right text-[15px] ${
                    value ? "text-bone" : "text-bone-faint"
                  }`}
                >
                  {value ?? "Skipped"}
                </dd>
              </motion.div>
            );
          })}
        </motion.dl>
      </motion.div>
    </motion.div>
  );
}
