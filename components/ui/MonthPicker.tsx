"use client";

import { Chip } from "./Chip";
import { monthShort } from "@/lib/data";
import type { Month } from "@/lib/types";

/** Horizontal scrolling month selector. Changes apply live. */
export function MonthStrip({
  value,
  onChange,
  highlight = [],
}: {
  value: Month;
  onChange: (m: Month) => void;
  /** Months the traveller can go. The others are dimmed but still selectable. */
  highlight?: Month[];
}) {
  return (
    <div
      role="group"
      aria-label="Travel month"
      className="scroll-y -mx-5 flex gap-2 overflow-x-auto overflow-y-hidden px-5"
    >
      {monthShort.map((label, i) => (
        <Chip
          key={label}
          active={value === i + 1}
          className={
            highlight.length > 0 && !highlight.includes((i + 1) as Month)
              ? "opacity-45"
              : ""
          }
          onClick={() => onChange((i + 1) as Month)}
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}
