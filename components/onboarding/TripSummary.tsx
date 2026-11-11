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

function labelFor(key: keyof TripAnswers, trip: TripAnswers): string | null {
  const q = questions.find((x) => x.key === key);
  if (!q) return null;
  const raw = trip[key];
  if (key === "month") return trip.month ? `${monthName(trip.month)} · ${seasonOf(trip.month)}` : null;
  if (key === "activities" || key === "transport") {
    const ids = key === "activities" ? trip.activities : trip.transport;
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
  { key: "month", label: "When" },
  { key: "duration", label: "How long" },
  { key: "transport", label: "Getting around" },
  { key: "accommodation", label: "Sleeping" },
  { key: "party", label: "Who" },
  { key: "activities", label: "Plans" },
  { key: "firstTime", label: "Experience" },
];

/** "Your trip at a glance": one ticket-style card, with a single quiet perforation. */
export function TripSummary({ trip }: { trip: TripAnswers }) {
  const month = trip.month;
  return (
    <div className="overflow-hidden rounded-[28px] border border-bone/[0.08] bg-char-800">
      <div className="px-6 pb-5 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre">
          Your trip
        </p>
        <p className="mt-1 font-display text-[34px] font-semibold leading-none text-bone">
          {month ? monthName(month) : "Month not set"}
        </p>
        {month && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
            {seasonOf(month)} in Australia
          </p>
        )}
      </div>
      <div className="relative border-t border-dashed border-bone/15">
        <span
          aria-hidden
          className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-ink"
        />
        <span
          aria-hidden
          className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-ink"
        />
        <dl className="space-y-3.5 px-6 pb-6 pt-6">
          {rows.slice(1).map(({ key, label }) => {
            const value = labelFor(key, trip);
            return (
              <div key={key} className="flex items-baseline justify-between gap-6">
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
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
