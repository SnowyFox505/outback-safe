"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useHydrated } from "@/lib/useHydrated";
import { ChevronLeft, Phone } from "lucide-react";
import { useRouteSaver } from "@/lib/useRouteSaver";
import { SaveControl } from "@/components/map/SaveControl";
import { getPlace, monthName } from "@/lib/data";
import {
  contextFromTrip,
  hazardsForPlace,
  maxSeverity,
  routeDistanceKm,
  routeRisk,
  stopName,
} from "@/lib/risk";
import { useTrip } from "@/lib/store";
import type { Stop } from "@/lib/types";
import { IconButton } from "@/components/ui/Button";
import { SeverityBadge, severityLabel } from "@/components/ui/SeverityBadge";
import { BottomSheet } from "@/components/sheet/BottomSheet";
import type { Snap } from "@/components/sheet/BottomSheet";
import { PlaceDetail } from "@/components/sheet/PlaceDetail";
import { RouteOverview } from "@/components/sheet/RouteOverview";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((m) => m.MapView),
  { ssr: false },
);

export default function MapPage() {
  const mounted = useHydrated();

  const {
    trip,
    stops,
    month,
    setMonth,
    addPlace,
    addCustom,
    removeStop,
    moveStop,
  } = useTrip();
  const context = useMemo(() => contextFromTrip(trip), [trip]);
  const saver = useRouteSaver();
  const [snap, setSnap] = useState<Snap>("peek");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(116);

  if (!mounted) return <div className="h-full bg-ink" />;

  const selected = selectedId ? getPlace(selectedId) : undefined;
  const routeStop = (id: string) =>
    stops.find((s) => s.kind === "place" && s.placeId === id);
  const risk = routeRisk(stops, month, context);

  function selectPlace(id: string) {
    setSelectedId(id);
    setSnap((s) => (s === "peek" ? "half" : s));
  }

  function openStop(stop: Stop) {
    if (stop.kind === "place") selectPlace(stop.placeId);
  }

  const header = selected ? (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
          {selected.state} · {monthName(month)}
        </p>
        <h1 className="truncate font-display text-[26px] leading-tight text-bone">
          {selected.name}
        </h1>
      </div>
      {(() => {
        const sev = maxSeverity(hazardsForPlace(selected.id, month, context));
        return sev ? <SeverityBadge severity={sev} /> : null;
      })()}
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
          {monthName(month)}
        </p>
        <h1 className="font-display text-[26px] leading-tight text-bone">
          {stops.length === 0 ? "Plan your route" : "Your route"}
        </h1>
        <p className="tabular text-[13px] text-bone-dim">
          {stops.length} stop{stops.length === 1 ? "" : "s"}
          {stops.length > 1 &&
            ` · ${routeDistanceKm(stops).toLocaleString("en-AU")} km`}
        </p>
      </div>
      {risk.level ? (
        <span className="rounded-full border border-bone/10 bg-bone/[0.05] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
          {severityLabel[risk.level]} risk
        </span>
      ) : null}
    </div>
  );

  return (
    <main className="relative h-full overflow-hidden bg-ink">
      <MapView
        stops={stops}
        month={month}
        context={context}
        selectedPlaceId={selectedId}
        bottomInset={visible}
        onSelectPlace={selectPlace}
        onAddCustom={(lat, lng) => {
          addCustom(lat, lng);
          setSnap("half");
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <Link href="/" aria-label="Back to home" className="pointer-events-auto">
          <IconButton label="Back" tabIndex={-1} aria-hidden>
            <ChevronLeft size={22} strokeWidth={1.5} />
          </IconButton>
        </Link>
        <Link
          href="/emergency"
          aria-label="Emergency"
          className="pointer-events-auto ml-2 mr-auto"
        >
          <IconButton label="Emergency" tabIndex={-1} aria-hidden>
            <Phone size={18} strokeWidth={1.5} className="text-rust" />
          </IconButton>
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <SaveControl
            state={saver.state}
            autoSave={saver.autoSave}
            signedIn={saver.signedIn}
            canSave={saver.canSave}
            routeId={saver.routeId}
            hasStops={stops.length > 0}
            onSave={() => void saver.saveNow()}
          />
        <button
          onClick={() => {
            setSelectedId(null);
            setSnap("half");
          }}
          className="flex h-11 items-center rounded-full border border-bone/10 bg-ink/70 px-4 font-mono text-[12px] uppercase tracking-[0.14em] text-bone backdrop-blur-md active:bg-char-700"
        >
          {monthName(month).slice(0, 3)}
        </button>
        </div>
      </div>

      <BottomSheet
        snap={snap}
        onSnapChange={setSnap}
        header={header}
        onVisibleChange={setVisible}
      >
        {selected ? (
          <PlaceDetail
            place={selected}
            month={month}
            context={context}
            inRoute={!!routeStop(selected.id)}
            onAdd={() => addPlace(selected.id)}
            onRemove={() => {
              const s = routeStop(selected.id);
              if (s) removeStop(s.id);
            }}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <RouteOverview
            stops={stops}
            month={month}
            candidateMonths={trip.months}
            context={context}
            trip={trip}
            onSelectPlace={selectPlace}
            onMonthChange={setMonth}
            onOpenStop={openStop}
            onMove={moveStop}
            onRemove={removeStop}
          />
        )}
      </BottomSheet>
      <span className="sr-only">
        {stops.map(stopName).join(", ") || "No stops yet"}
      </span>
    </main>
  );
}
