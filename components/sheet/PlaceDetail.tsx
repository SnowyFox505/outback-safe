"use client";

import { Check, MapPin, Plus, X } from "lucide-react";
import { monthName } from "@/lib/data";
import { isBoosted, placeHazardGroups } from "@/lib/risk";
import type { HazardContext } from "@/lib/risk";
import type { Month, Place } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { HazardCard } from "./HazardCard";
import { PlaceArt } from "./PlaceArt";

interface PlaceDetailProps {
  place: Place;
  month: Month;
  context: HazardContext;
  inRoute: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export function PlaceDetail({
  place,
  month,
  context,
  inRoute,
  onAdd,
  onRemove,
  onClose,
}: PlaceDetailProps) {
  const { active, offSeason, notRelevant } = placeHazardGroups(
    place.id,
    month,
    context,
  );

  return (
    <div className="space-y-6 pt-1">
      <PlaceArt place={place} />

      <div className="flex items-center gap-2">
        {inRoute ? (
          <Button variant="glass" className="flex-1" onClick={onRemove}>
            <Check size={18} strokeWidth={1.5} />
            In your route · Remove
          </Button>
        ) : (
          <Button className="flex-1" onClick={onAdd}>
            <Plus size={18} strokeWidth={1.75} />
            Add to route
          </Button>
        )}
        <Button variant="glass" aria-label="Close place" onClick={onClose} className="w-12 px-0">
          <X size={18} strokeWidth={1.5} />
        </Button>
      </div>

      <p className="text-[15px] leading-relaxed text-bone-dim">
        {place.description}
      </p>

      <section className="rounded-[24px] border border-bone/[0.07] bg-char-800 p-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ochre">
          Did you know
        </p>
        <ul className="space-y-2 text-[14px] leading-relaxed text-bone">
          {place.funFacts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section>
        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
          Hazards in {monthName(month)}
        </p>
        {active.length === 0 ? (
          <p className="rounded-[20px] bg-bone/[0.04] px-4 py-4 text-[14px] text-bone-dim">
            Nothing flagged for {place.name} in {monthName(month)}.
          </p>
        ) : (
          <div className="space-y-2">
            {active.map((h) => (
              <HazardCard
                key={h.id}
                hazard={h}
                boosted={isBoosted(h, context)}
              />
            ))}
          </div>
        )}
        {offSeason.length > 0 && (
          <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-bone-faint">
            <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            <span>
              Not active in {monthName(month)}:{" "}
              {offSeason.map((h) => h.name).join(", ")}.
            </span>
          </p>
        )}
        {notRelevant.length > 0 && (
          <p className="mt-2 flex items-start gap-2 text-[12px] leading-relaxed text-bone-faint">
            <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            <span>
              Hidden because of your trip answers:{" "}
              {notRelevant.map((h) => h.name).join(", ")}.
            </span>
          </p>
        )}
      </section>
    </div>
  );
}
