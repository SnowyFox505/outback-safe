"use client";

import { Check, Lightbulb, MapPin, Plus, Route, X } from "lucide-react";
import { monthName } from "@/lib/data";
import { isBoosted, placeHazardGroups } from "@/lib/risk";
import type { HazardContext } from "@/lib/risk";
import { trailLine } from "@/lib/suggestions";
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
    <div className="rise-group space-y-6 pt-1">
      <PlaceArt place={place} />

      <div className="rise flex items-center gap-2">
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
        <Button
          variant="glass"
          aria-label="Close place"
          onClick={onClose}
          className="w-12 px-0"
        >
          <X size={18} strokeWidth={1.5} />
        </Button>
      </div>

      <div className="rise space-y-2">
        {place.access && (
          <p className="flex items-start gap-2 text-[13px] text-bone-dim">
            <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            {place.access}
          </p>
        )}
        <p className="text-[15px] leading-relaxed text-bone-dim">
          {place.description}
        </p>
      </div>

      {place.trail && (
        <section className="rise rounded-[24px] border border-bone/[0.07] bg-char-800 p-4">
          <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ochre">
            <Route size={13} strokeWidth={1.5} />
            {place.trail.name ?? "Walk"}
          </p>
          <p className="tabular text-[15px] text-bone">
            {trailLine(place.trail)}
          </p>
          {place.trail.note && (
            <p className="mt-2 text-[13px] leading-relaxed text-bone-dim">
              {place.trail.note}
            </p>
          )}
        </section>
      )}

      {place.tip && (
        <section className="rise flex items-start gap-3 rounded-[24px] border border-bone/[0.07] bg-char-800 p-4">
          <Lightbulb
            size={16}
            strokeWidth={1.5}
            className="mt-0.5 shrink-0 text-ochre"
          />
          <p className="text-[14px] leading-relaxed text-bone">{place.tip}</p>
        </section>
      )}

      {place.funFacts.length > 0 && (
        <section className="rise rounded-[24px] border border-bone/[0.07] bg-char-800 p-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ochre">
            Did you know
          </p>
          <ul className="space-y-2 text-[14px] leading-relaxed text-bone">
            {place.funFacts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rise">
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

      {place.sources && place.sources.length > 0 && (
        <p className="text-[12px] leading-relaxed text-bone-faint">
          Sources:{" "}
          {place.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ", "}
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-bone/20 underline-offset-2"
              >
                {s.name}
              </a>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
