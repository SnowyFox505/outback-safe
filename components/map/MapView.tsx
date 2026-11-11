"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { places } from "@/lib/data";
import { hazardsForPlace, maxSeverity, stopCoords } from "@/lib/risk";
import type { HazardContext } from "@/lib/risk";
import { severityColor } from "@/components/ui/SeverityBadge";
import type { Month, Stop } from "@/lib/types";

// The worker is served from /public; bundlers cannot resolve it reliably.
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

const STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const AUSTRALIA_BOUNDS: [[number, number], [number, number]] = [
  [112.5, -44.5],
  [154.5, -9.5],
];

interface MapViewProps {
  stops: Stop[];
  month: Month;
  context: HazardContext;
  selectedPlaceId: string | null;
  /** Pixels covered by the bottom sheet, so the map keeps focus visible. */
  bottomInset: number;
  onSelectPlace: (placeId: string) => void;
  onAddCustom: (lat: number, lng: number) => void;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function MapView({
  stops,
  month,
  context,
  selectedPlaceId,
  bottomInset,
  onSelectPlace,
  onAddCustom,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const pinsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const customMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const readyRef = useRef(false);
  const syncRef = useRef<(() => void) | null>(null);

  const onSelectRef = useRef(onSelectPlace);
  const onAddCustomRef = useRef(onAddCustom);
  useEffect(() => {
    onSelectRef.current = onSelectPlace;
    onAddCustomRef.current = onAddCustom;
  });

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      bounds: AUSTRALIA_BOUNDS,
      fitBoundsOptions: { padding: { top: 90, left: 20, right: 20, bottom: 190 } },
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      maxZoom: 12,
    });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    // Place pins.
    for (const place of places) {
      const el = document.createElement("button");
      el.className = "pin";
      el.setAttribute("aria-label", place.name);
      el.innerHTML = `<span class="pin-dot"></span><span class="pin-label">${place.name}</span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(place.id);
      });
      new maplibregl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
      pinsRef.current.set(place.id, el);
    }

    map.on("load", () => {
      // Quiet the base map so the route and pins lead.
      if (map.getLayer("background"))
        map.setPaintProperty("background", "background-color", "#0d0c0b");
      if (map.getLayer("water"))
        map.setPaintProperty("water", "fill-color", "#0f1a1f");

      // Our own pins carry the names, so hide the base map's place labels.
      for (const layer of map.getStyle().layers) {
        if (layer.id.startsWith("place_")) {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      }

      map.addSource("route", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#d9a441",
          "line-width": 8,
          "line-opacity": 0.14,
          "line-blur": 6,
        },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#d9a441",
          "line-width": 3,
          "line-dasharray": [0.1, 2.2],
        },
      });
      readyRef.current = true;
      syncRef.current?.();
    });

    // Long press (or right click) on empty map adds a free stop.
    const canvas = map.getCanvasContainer();
    let timer: number | undefined;
    let start: { x: number; y: number } | null = null;
    const clear = () => {
      window.clearTimeout(timer);
      start = null;
    };
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest(".pin")) return;
      const rect = canvas.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY };
      timer = window.setTimeout(() => {
        if (!start) return;
        const ll = map.unproject([start.x - rect.left, start.y - rect.top]);
        onAddCustomRef.current(ll.lat, ll.lng);
        if (navigator.vibrate) navigator.vibrate(10);
        start = null;
      }, 600);
    };
    const onMove = (e: PointerEvent) => {
      if (!start) return;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) clear();
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", clear);
    canvas.addEventListener("pointercancel", clear);
    map.on("movestart", clear);

    const pins = pinsRef.current;
    const customs = customMarkersRef.current;
    return () => {
      clear();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", clear);
      canvas.removeEventListener("pointercancel", clear);
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
      pins.clear();
      customs.clear();
    };
  }, []);

  // Keep pins, custom markers and the route line in sync with state.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = () => {
      // Pins for known places.
      const order = new Map<string, number>();
      stops.forEach((s, i) => {
        if (s.kind === "place" && !order.has(s.placeId)) order.set(s.placeId, i + 1);
      });
      for (const place of places) {
        const el = pinsRef.current.get(place.id);
        if (!el) continue;
        const sev = maxSeverity(hazardsForPlace(place.id, month, context));
        el.style.setProperty(
          "--pin-color",
          sev ? severityColor[sev] : "var(--color-bone-dim)",
        );
        const n = order.get(place.id);
        el.classList.toggle("in-route", n !== undefined);
        el.classList.toggle("selected", selectedPlaceId === place.id);
        const dot = el.querySelector(".pin-dot");
        if (dot) dot.textContent = n !== undefined ? String(n) : "";
      }

      // Free stops.
      const live = new Set<string>();
      stops.forEach((s, i) => {
        if (s.kind !== "custom") return;
        live.add(s.id);
        let marker = customMarkersRef.current.get(s.id);
        if (!marker) {
          const el = document.createElement("div");
          el.className = "pin custom in-route";
          el.innerHTML = `<span class="pin-dot"></span>`;
          marker = new maplibregl.Marker({ element: el })
            .setLngLat([s.lng, s.lat])
            .addTo(map);
          customMarkersRef.current.set(s.id, marker);
        }
        const dot = marker.getElement().querySelector(".pin-dot");
        if (dot) dot.textContent = String(i + 1);
      });
      for (const [id, marker] of customMarkersRef.current) {
        if (!live.has(id)) {
          marker.remove();
          customMarkersRef.current.delete(id);
        }
      }

      // Route line.
      const source = map.getSource("route") as maplibregl.GeoJSONSource | undefined;
      source?.setData({
        type: "FeatureCollection",
        features:
          stops.length > 1
            ? [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: stops.map(stopCoords),
                  },
                },
              ]
            : [],
      });
    };

    syncRef.current = sync;
    if (readyRef.current) sync();
  }, [stops, month, context, selectedPlaceId]);

  // Bring the selected place into the visible area above the sheet.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;
    map.easeTo({
      center: [place.lng, place.lat],
      zoom: Math.max(map.getZoom(), 4.6),
      padding: { top: 60, bottom: bottomInset, left: 0, right: 0 },
      duration: prefersReducedMotion() ? 0 : 600,
    });
  }, [selectedPlaceId, bottomInset]);

  // MapLibre forces position: relative on its container, so size it via a wrapper.
  return (
    <div className="absolute inset-0 bg-ink">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
