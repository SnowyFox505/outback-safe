"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, X } from "lucide-react";
import { monthName } from "@/lib/data";
import {
  distanceKm,
  legHazards,
  maxSeverity,
  routeRisk,
  stopCoords,
  stopHazards,
  stopName,
} from "@/lib/risk";
import type { Month, Severity, Stop } from "@/lib/types";
import { MonthStrip } from "@/components/ui/MonthPicker";
import { SeverityDot, severityLabel } from "@/components/ui/SeverityBadge";
import { HazardCard } from "./HazardCard";
import { RiskRing } from "./RiskRing";

interface RouteOverviewProps {
  stops: Stop[];
  month: Month;
  onMonthChange: (m: Month) => void;
  onOpenStop: (stop: Stop) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
}

export function RouteOverview({
  stops,
  month,
  onMonthChange,
  onOpenStop,
  onMove,
  onRemove,
}: RouteOverviewProps) {
  const [explain, setExplain] = useState(false);
  const [openLeg, setOpenLeg] = useState<string | null>(null);
  const risk = routeRisk(stops, month);

  return (
    <div className="space-y-6 pt-1">
      <section>
        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
          Travel month
        </p>
        <MonthStrip value={month} onChange={onMonthChange} />
      </section>

      {stops.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-bone/15 px-5 py-8 text-center">
          <p className="font-display text-[19px] text-bone">Start your route</p>
          <p className="mx-auto mt-1.5 max-w-[26ch] text-[14px] leading-relaxed text-bone-dim">
            Tap a place on the map, then add it. Press and hold the map to drop
            your own stop.
          </p>
        </div>
      ) : (
        <>
          <section className="flex items-center gap-4 rounded-[24px] border border-bone/[0.07] bg-char-800 p-4">
            <RiskRing score={risk.score} level={risk.level} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
                Route risk in {monthName(month)}
              </p>
              <p className="font-display text-[24px] leading-tight text-bone">
                {risk.level ? severityLabel[risk.level as Severity] : "Nothing flagged"}
              </p>
              <p className="text-[13px] text-bone-dim">
                {risk.hazardCount} hazard{risk.hazardCount === 1 ? "" : "s"}
                {risk.highCount > 0 ? `, ${risk.highCount} high` : ""}
              </p>
            </div>
          </section>

          <section>
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
              Your route
            </p>
            <ol>
              {stops.map((stop, i) => {
                const hz = stopHazards(stop, month);
                const sev = maxSeverity(hz);
                const next = stops[i + 1];
                const leg = next ? legHazards(stop, next, month) : [];
                const km = next
                  ? Math.round(distanceKm(stopCoords(stop), stopCoords(next)))
                  : 0;
                const legOpen = openLeg === stop.id;
                return (
                  <li key={stop.id}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenStop(stop)}
                        className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3 rounded-[18px] px-1 text-left active:bg-bone/[0.04]"
                      >
                        <span className="tabular grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ochre font-mono text-[13px] font-semibold text-ink">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[16px] font-medium text-bone">
                            {stopName(stop)}
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px] text-bone-dim">
                            {sev ? (
                              <>
                                <SeverityDot severity={sev} />
                                {hz.length} hazard{hz.length === 1 ? "" : "s"}
                              </>
                            ) : stop.kind === "custom" ? (
                              "Free stop, no hazard data"
                            ) : (
                              "No hazards flagged"
                            )}
                          </span>
                        </span>
                      </button>
                      <RowButton
                        label={`Move ${stopName(stop)} up`}
                        disabled={i === 0}
                        onClick={() => onMove(stop.id, -1)}
                      >
                        <ArrowUp size={18} strokeWidth={1.5} />
                      </RowButton>
                      <RowButton
                        label={`Move ${stopName(stop)} down`}
                        disabled={i === stops.length - 1}
                        onClick={() => onMove(stop.id, 1)}
                      >
                        <ArrowDown size={18} strokeWidth={1.5} />
                      </RowButton>
                      <RowButton
                        label={`Remove ${stopName(stop)}`}
                        onClick={() => onRemove(stop.id)}
                      >
                        <X size={18} strokeWidth={1.5} />
                      </RowButton>
                    </div>

                    {next && (
                      <div className="ml-4 border-l border-dashed border-bone/20 pl-6">
                        <button
                          onClick={() => setOpenLeg(legOpen ? null : stop.id)}
                          aria-expanded={legOpen}
                          className="flex min-h-[44px] w-full items-center gap-2 text-left text-[13px] text-bone-dim"
                        >
                          <span className="tabular font-mono text-[12px]">
                            {km.toLocaleString("en-AU")} km
                          </span>
                          <span className="text-bone-faint">·</span>
                          <span className="flex-1">
                            {leg.length} hazard{leg.length === 1 ? "" : "s"} on this leg
                          </span>
                          <ChevronDown
                            size={16}
                            strokeWidth={1.5}
                            className={`transition-transform duration-200 ${
                              legOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {legOpen && (
                          <div className="mb-3 space-y-2">
                            {leg.length === 0 ? (
                              <p className="text-[13px] text-bone-faint">
                                Nothing flagged for this leg in {monthName(month)}.
                              </p>
                            ) : (
                              leg.map((h) => <HazardCard key={h.id} hazard={h} />)
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      <section className="rounded-[20px] bg-bone/[0.04] px-4 py-3">
        <button
          onClick={() => setExplain((e) => !e)}
          aria-expanded={explain}
          className="flex min-h-[44px] w-full items-center justify-between text-left text-[14px] text-bone"
        >
          How is risk calculated?
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className={`text-bone-dim transition-transform duration-200 ${
              explain ? "rotate-180" : ""
            }`}
          />
        </button>
        {explain && (
          <div className="space-y-2 pb-2 text-[13px] leading-relaxed text-bone-dim">
            <p>
              We list every hazard that is active in your travel month at each
              stop. Each hazard counts 1 (low), 2 (moderate) or 3 (high). The
              score compares the total with a busy trip of 30 points. The level
              is the highest hazard found, so one high hazard always shows as
              High.
            </p>
            <p>
              Free stops have no hazard data. Hazards are based on public
              sources and are a guide only.
            </p>
          </div>
        )}
        <p className="border-t border-bone/10 pt-2.5 text-[12px] text-bone-faint">
          Not official safety advice. Always follow local signs, rangers and
          emergency services.
        </p>
      </section>
    </div>
  );
}

function RowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-11 w-9 shrink-0 place-items-center rounded-full text-bone-dim active:bg-bone/[0.08] disabled:opacity-25"
    >
      {children}
    </button>
  );
}
