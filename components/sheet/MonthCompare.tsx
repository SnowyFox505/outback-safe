"use client";

import { motion } from "motion/react";
import { monthName } from "@/lib/data";
import { bestMonth, compareMonths } from "@/lib/monthCompare";
import type { HazardContext } from "@/lib/risk";
import type { Month, Stop } from "@/lib/types";
import { severityColor } from "@/components/ui/SeverityBadge";

interface MonthCompareProps {
  stops: Stop[];
  months: Month[];
  active: Month;
  context: HazardContext;
  onSelect: (m: Month) => void;
}

/** Compares the months you can travel for this route and highlights the calmest one. */
export function MonthCompare({
  stops,
  months,
  active,
  context,
  onSelect,
}: MonthCompareProps) {
  if (months.length < 2) return null;

  if (stops.length === 0) {
    return (
      <section className="rounded-[24px] border border-dashed border-bone/15 px-5 py-4 text-[14px] leading-relaxed text-bone-dim">
        You can travel in {months.length} months. Add stops to see which month is
        best for your route.
      </section>
    );
  }

  const scores = compareMonths(stops, months, context);
  const best = bestMonth(scores, stops.length > 0);
  const bestScore = scores.find((s) => s.month === best);

  return (
    <section
      aria-labelledby="best-month"
      className="rounded-[24px] border border-bone/[0.07] bg-char-800 p-4"
    >
      <p
        id="best-month"
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint"
      >
        Compare your months
      </p>
      <p className="mb-3 mt-1.5 text-[14px] leading-relaxed text-bone">
        {best && bestScore ? (
          <>
            <span className="font-medium text-ochre">{monthName(best)}</span> is
            the calmest for this route: {bestScore.risk.hazardCount} hazard
            {bestScore.risk.hazardCount === 1 ? "" : "s"}
            {bestScore.risk.highCount > 0
              ? `, ${bestScore.risk.highCount} high`
              : ", none high"}
            .
          </>
        ) : (
          "These months look about the same for this route."
        )}
      </p>
      <ul className="space-y-1.5">
        {scores.map(({ month, risk }, index) => {
          const isBest = month === best;
          const isActive = month === active;
          return (
            <li key={month}>
              <button
                onClick={() => onSelect(month)}
                aria-pressed={isActive}
                className={`flex min-h-[56px] w-full items-center gap-3 rounded-[18px] border px-3.5 py-2 text-left transition-colors duration-200 ${
                  isActive
                    ? "border-ochre/70 bg-ochre/[0.08]"
                    : "border-transparent active:bg-bone/[0.04]"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[15px] font-medium text-bone">
                    {monthName(month)}
                    {isBest && (
                      <span className="rounded-full bg-ochre px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-ink">
                        Best
                      </span>
                    )}
                  </span>
                  <span className="tabular block text-[12px] text-bone-dim">
                    {risk.hazardCount} hazard{risk.hazardCount === 1 ? "" : "s"}
                    {risk.highCount > 0 ? ` · ${risk.highCount} high` : ""}
                  </span>
                </span>
                <span
                  className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-bone/10"
                  role="img"
                  aria-label={`Risk score ${risk.score} out of 100`}
                >
                  <motion.span
                    className="block h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(6, risk.score)}%` }}
                    transition={{
                      duration: 0.7,
                      delay: 0.15 + index * 0.07,
                      ease: [0.22, 0.8, 0.28, 1],
                    }}
                    style={{
                      background: risk.level
                        ? severityColor[risk.level]
                        : "var(--color-bone-faint)",
                    }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
