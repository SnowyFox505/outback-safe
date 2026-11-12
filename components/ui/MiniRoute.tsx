import { AUSTRALIA_PATHS, AUSTRALIA_VIEWBOX } from "@/components/loading/australiaOutline";
import { stopCoords } from "@/lib/risk";
import type { Stop } from "@/lib/types";

/**
 * Longitude and latitude to the outline's coordinates. The outline spans about
 * 113.15 to 153.64 degrees east and 10.68 to 43.64 degrees south.
 */
function project(lng: number, lat: number): [number, number] {
  return [(lng - 113.15) * 7.41, (-lat - 10.68) * 8.22];
}

/** A tiny Australia with the stops of a route drawn on it. */
export function MiniRoute({
  stops,
  className = "",
}: {
  stops: Stop[];
  className?: string;
}) {
  const points = stops
    .map(stopCoords)
    .filter(([lng]) => lng !== 0)
    .map(([lng, lat]) => project(lng, lat));
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg
      aria-hidden
      viewBox={AUSTRALIA_VIEWBOX}
      className={`overflow-visible ${className}`}
    >
      {AUSTRALIA_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="rgb(237 230 218 / 0.05)"
          stroke="rgb(237 230 218 / 0.28)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      ))}
      {points.length > 1 && (
        <polyline
          points={line}
          fill="none"
          stroke="#d9a441"
          strokeWidth={1.4}
          strokeDasharray="3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 0 ? 8 : 6}
          fill={i === 0 ? "#d9a441" : "#0d0c0b"}
          stroke="#d9a441"
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
