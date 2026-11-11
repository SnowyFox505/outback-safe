import type { Place } from "@/lib/types";

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

const tint: Record<Place["kind"], string> = {
  city: "#d9a441",
  park: "#b5502d",
  region: "#d9a441",
  reef: "#3e8fa6",
  coast: "#3e8fa6",
  trail: "#d9a441",
  sight: "#b5502d",
};

/**
 * Calm topographic contour illustration, generated per place.
 * Stands in for photos until licensed images are added.
 */
export function PlaceArt({
  place,
  className = "",
}: {
  place: Place;
  className?: string;
}) {
  if (place.image) {
    const { image } = place;
    return (
      <figure className={`m-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className="block h-[190px] w-full rounded-[24px] bg-char-800 object-cover"
        />
        <figcaption className="mt-1.5 px-1 text-[11px] leading-snug text-bone-faint">
          Photo:{" "}
          <a
            href={image.url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-bone/20 underline-offset-2"
          >
            {image.credit}
          </a>
          , {image.licence}
        </figcaption>
      </figure>
    );
  }
  const rand = rng(place.id);
  const lines = Array.from({ length: 13 }, (_, i) => {
    const base = 14 + i * 13;
    const amp = 4 + rand() * 11;
    const freq = 0.012 + rand() * 0.014;
    const phase = rand() * 6.28;
    const drift = (rand() - 0.5) * 0.06;
    let d = "";
    for (let x = 0; x <= 400; x += 10) {
      const yy = base + amp * Math.sin(x * freq + phase) + x * drift;
      d += `${x === 0 ? "M" : "L"}${x} ${yy.toFixed(1)} `;
    }
    return { d, accent: i === 6 };
  });
  const color = tint[place.kind];

  return (
    <svg
      viewBox="0 0 400 190"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Illustration for ${place.name}`}
      className={`block w-full rounded-[24px] bg-char-800 ${className}`}
    >
      {lines.map((l, i) => (
        <path
          key={i}
          d={l.d}
          fill="none"
          stroke={l.accent ? color : "#ede6da"}
          strokeOpacity={l.accent ? 0.9 : 0.08 + (i % 3) * 0.04}
          strokeWidth={l.accent ? 1.6 : 1}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
