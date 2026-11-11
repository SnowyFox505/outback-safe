"use client";

import { Minus, Plus } from "lucide-react";
import type { Month, TripAnswers } from "@/lib/types";

interface LongerTripProps {
  trip: TripAnswers;
  onChange: (patch: Partial<TripAnswers>) => void;
}

const MIN_WEEKS = 5;
const MAX_WEEKS = 52;

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-12 w-12 place-items-center rounded-full border border-bone/10 bg-char-700 text-bone transition-colors duration-200 active:bg-char-600 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** Extra details for long trips: how many weeks, and an optional start date. */
export function LongerTrip({ trip, onChange }: LongerTripProps) {
  const weeks = trip.durationWeeks ?? 6;

  return (
    <div className="mt-4 space-y-4 rounded-[24px] border border-bone/[0.08] bg-char-800 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-bone">How many weeks?</p>
          <p className="text-[13px] text-bone-dim">Roughly is fine.</p>
        </div>
        <div className="flex items-center gap-3">
          <StepButton
            label="One week less"
            disabled={weeks <= MIN_WEEKS}
            onClick={() => onChange({ durationWeeks: weeks - 1 })}
          >
            <Minus size={18} strokeWidth={1.75} />
          </StepButton>
          <span className="tabular w-8 text-center font-mono text-[20px] text-bone">
            {weeks}
          </span>
          <StepButton
            label="One week more"
            disabled={weeks >= MAX_WEEKS}
            onClick={() => onChange({ durationWeeks: weeks + 1 })}
          >
            <Plus size={18} strokeWidth={1.75} />
          </StepButton>
        </div>
      </div>

      <div>
        <label
          htmlFor="start-date"
          className="mb-1.5 block text-[15px] font-medium text-bone"
        >
          Start date <span className="font-normal text-bone-faint">(optional)</span>
        </label>
        <input
          id="start-date"
          type="date"
          value={trip.startDate ?? ""}
          onChange={(e) => {
            const value = e.target.value || null;
            const patch: Partial<TripAnswers> = { startDate: value };
            // A start date also tells us the month to look at.
            if (value) {
              const m = Number(value.slice(5, 7)) as Month;
              if (m >= 1 && m <= 12 && trip.months.length === 0) {
                patch.months = [m];
                patch.month = m;
              }
            }
            onChange(patch);
          }}
          className="h-12 w-full rounded-[16px] border border-bone/10 bg-ink px-4 text-[16px] text-bone outline-none focus:border-ochre"
        />
      </div>
    </div>
  );
}
