"use client";

import { ChevronRight } from "lucide-react";
import { fitsParty, ideasNearBases, partyLabel, trailLine } from "@/lib/suggestions";
import type { Party, Stop, TripAnswers } from "@/lib/types";

interface NearbyIdeasProps {
  trip: TripAnswers;
  stops: Stop[];
  onSelectPlace: (id: string) => void;
}

/** Day trips and walks near the base cities the traveller picked. */
export function NearbyIdeas({ trip, stops, onSelectPlace }: NearbyIdeasProps) {
  const groups = ideasNearBases(trip, stops);
  if (groups.length === 0) return null;

  return (
    <section className="space-y-5">
      {groups.map(({ base, ideas }) => (
        <div key={base.id}>
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
            Ideas near {base.name}
          </p>
          <ul className="space-y-1.5">
            {ideas.map((place) => (
              <li key={place.id}>
                <button
                  onClick={() => onSelectPlace(place.id)}
                  className="flex min-h-[60px] w-full items-center gap-3 rounded-[18px] border border-bone/[0.07] bg-char-800 px-4 py-2.5 text-left active:bg-char-700"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-bone">
                      {place.name}
                    </span>
                    <span className="tabular block truncate text-[12px] text-bone-dim">
                      {place.trail && trailLine(place.trail)
                        ? trailLine(place.trail)
                        : place.access ?? place.description}
                    </span>
                    {fitsParty(place, trip.party) && (
                      <span className="mt-1 inline-block rounded-full bg-ochre/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ochre">
                        Good for {partyLabel[trip.party as Party].toLowerCase()}
                      </span>
                    )}
                  </span>
                  <ChevronRight
                    size={18}
                    strokeWidth={1.5}
                    className="shrink-0 text-bone-faint"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
