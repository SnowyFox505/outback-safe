"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionValue } from "motion/react";
import { AUSTRALIA_PATHS, AUSTRALIA_VIEWBOX } from "@/components/loading/australiaOutline";

/** How many stacked paper layers the relief has. */
const LAYERS = 7;
const BASE_GAP = 20;
const BASE_RX = 57;
const BASE_RZ = -20;

// Stops of the floating route, in outline coordinates (Perth, Uluru, Alice
// Springs, Darwin, Cairns, Sydney), projected the same way as the outline.
const ROUTE: [number, number][] = [
  [20, 172],
  [130, 118],
  [151, 104],
  [128, 17],
  [238, 50],
  [277, 186],
];

/** A smooth curve through the points (Catmull-Rom turned into cubic Béziers). */
function smoothPath(pts: [number, number][]): string {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
const ROUTE_PATH = smoothPath(ROUTE);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Where the camera was left, so a new scene can ease back from it. */
const left = { rx: 0, rz: 0 };

function Layer({
  index,
  gap,
  fade,
}: {
  index: number;
  gap: MotionValue<number>;
  fade: MotionValue<number>;
}) {
  const z = useTransform(gap, (g) => -(LAYERS - 1 - index) * g);
  // The top layers leave first when the camera dives through.
  const opacity = useTransform(fade, (f) => {
    const start = (LAYERS - 1 - index) * 0.07;
    return 1 - clamp((f - start) / 0.4, 0, 1);
  });
  const t = index / (LAYERS - 1);
  const top = index === LAYERS - 1;
  const scale = 1 - index * 0.022;
  // Lower layers are darker and cooler, the top one catches the ochre light.
  const fill = top
    ? "rgba(217,164,65,0.09)"
    : `rgb(${Math.round(18 + t * 22)} ${Math.round(16 + t * 18)} ${Math.round(14 + t * 12)})`;
  const stroke = top ? "#d9a441" : "#ede6da";
  const strokeOpacity = top ? 0.85 : 0.07 + t * 0.12;

  return (
    <motion.svg
      aria-hidden
      viewBox={AUSTRALIA_VIEWBOX}
      style={{ z, opacity, scale }}
      className="absolute inset-0 h-full w-full overflow-visible"
    >
      {AUSTRALIA_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={fill}
          stroke={stroke}
          strokeOpacity={strokeOpacity}
          strokeWidth={top ? 1.1 : 0.8}
          strokeLinejoin="round"
        />
      ))}
    </motion.svg>
  );
}

interface LoginSceneProps {
  /** Change this value to give the relief a small nudge (for example on a mode switch). */
  nudge?: string | number;
  /** Fly the camera down through the layers, then call onDiveEnd. */
  dive?: boolean;
  onDiveEnd?: () => void;
  /** A slower, pointer-free version for the home screen: it only drifts on its own. */
  calm?: boolean;
}

/**
 * The login backdrop: Australia as a stack of paper layers, like a topographic
 * model. It tilts with the mouse or a finger, breathes slowly on its own, and
 * a dotted route with a travelling dot floats above it. Plain CSS 3D, no WebGL.
 */
export function LoginScene({ nudge, dive = false, onDiveEnd, calm = false }: LoginSceneProps) {
  const reduce = !!useReducedMotion();

  // Pointer position from -1 to 1, smoothed by springs.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 16, mass: 0.8 });
  const sy = useSpring(py, { stiffness: 70, damping: 16, mass: 0.8 });
  const breathe = useMotionValue(0);

  // Extra camera moves on top of the resting pose.
  const extraRx = useMotionValue(left.rx);
  const extraRz = useMotionValue(left.rz);
  const gap = useMotionValue(BASE_GAP);
  const dolly = useMotionValue(0);
  const fade = useMotionValue(0);

  const rx = useTransform(
    [sy, breathe, extraRx],
    ([y, b, e]: number[]) => BASE_RX - y * 8 + b * (calm ? 2.6 : 1.2) + e,
  );
  const rz = useTransform(
    [sx, breathe, extraRz],
    ([x, b, e]: number[]) => BASE_RZ + x * 13 + b * (calm ? 8 : 3) + e,
  );

  useAnimationFrame((t) => {
    if (!reduce && !dive) breathe.set(Math.sin(t / (calm ? 9000 : 4200)));
  });

  // Mouse or finger.
  useEffect(() => {
    if (reduce || dive || calm) return;
    const move = (e: PointerEvent) => {
      px.set(clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1));
      py.set(clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1));
    };
    const rest = () => {
      px.set(0);
      py.set(0);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", rest);
    window.addEventListener("pointercancel", rest);
    document.documentElement.addEventListener("pointerleave", rest);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", rest);
      window.removeEventListener("pointercancel", rest);
      document.documentElement.removeEventListener("pointerleave", rest);
    };
  }, [px, py, reduce, dive, calm]);

  // Ease back to the resting pose if the camera was left somewhere else.
  useEffect(() => {
    if (dive || reduce) return;
    const a = animate(extraRx, 0, { duration: 1.4, ease: [0.22, 0.8, 0.28, 1] });
    const b = animate(extraRz, 0, { duration: 1.4, ease: [0.22, 0.8, 0.28, 1] });
    return () => {
      a.stop();
      b.stop();
    };
  }, [dive, reduce, extraRx, extraRz]);

  // A small nudge: layers spread a little and the model turns.
  useEffect(() => {
    if (reduce || dive || nudge === undefined) return;
    const a = animate(gap, [BASE_GAP, BASE_GAP + 16, BASE_GAP], {
      duration: 0.9,
      ease: "easeOut",
    });
    const b = animate(extraRz, [0, 7, 0], { duration: 0.9, ease: "easeInOut" });
    return () => {
      a.stop();
      b.stop();
    };
  }, [nudge, reduce, dive, gap, extraRz]);

  // The dive: tilt towards top-down, spread the layers and rush through them.
  useEffect(() => {
    if (!dive) return;
    const ease = [0.5, 0, 0.2, 1] as const;
    const anims = [
      animate(extraRx, -48, { duration: 1.5, ease }),
      animate(extraRz, 16, { duration: 1.5, ease }),
      animate(gap, 120, { duration: 1.5, ease }),
      animate(dolly, 520, { duration: 1.5, ease }),
      animate(fade, 1, { duration: 1.35, delay: 0.1, ease: "easeIn" }),
    ];
    const timer = window.setTimeout(() => onDiveEnd?.(), 1500);
    return () => {
      anims.forEach((a) => a.stop());
      window.clearTimeout(timer);
    };
  }, [dive, onDiveEnd, extraRx, extraRz, gap, dolly, fade]);

  useEffect(
    () => () => {
      left.rx = dive ? 0 : extraRx.get();
      left.rz = dive ? 0 : extraRz.get();
    },
    [dive, extraRx, extraRz],
  );

  const gridZ = useTransform(gap, (g) => -(LAYERS - 1) * g - 36);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${calm ? "opacity-[0.5]" : ""}`}
      style={{ perspective: 900, perspectiveOrigin: "50% 38%" }}
    >
      <div
        className={`absolute left-1/2 ${calm ? "top-[68%]" : "top-[49%]"} aspect-[300/271] w-[min(116vw,560px)] -translate-x-1/2 -translate-y-1/2`}
      >
        <motion.div
          style={{
            rotateX: rx,
            rotateZ: rz,
            z: dolly,
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-0"
        >
          {/* A faint grid on the table under the model. */}
          <motion.div
            style={{
              z: gridZ,
              backgroundImage:
                "linear-gradient(rgb(237 230 218 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(237 230 218 / 0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage: "radial-gradient(closest-side, #000 40%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(closest-side, #000 40%, transparent 100%)",
            }}
            className="absolute -inset-[30%]"
          />

          {Array.from({ length: LAYERS }, (_, i) => (
            <Layer key={i} index={i} gap={gap} fade={fade} />
          ))}

          {/* The route floats above the top layer. */}
          <motion.svg
            viewBox={AUSTRALIA_VIEWBOX}
            style={{ z: 26, scale: 1 - (LAYERS - 1) * 0.022 }}
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="#d9a441"
              strokeOpacity={0.9}
              strokeWidth={1.3}
              strokeLinecap="round"
              className="scene-route"
            />
            {ROUTE.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={3.2} fill="none" stroke="#d9a441" strokeOpacity={0.5} className="scene-ping" style={{ animationDelay: `${i * 0.5}s` }} />
                <circle cx={x} cy={y} r={2} fill="#d9a441" />
              </g>
            ))}
            {!reduce && (
              <circle r={3} fill="#f3d38a">
                <animateMotion dur="16s" repeatCount="indefinite" path={ROUTE_PATH} />
              </circle>
            )}
          </motion.svg>
        </motion.div>
      </div>

      {/* Keep the text readable: fade the model out towards the top and bottom. */}
      <div
        className={`absolute inset-0 ${
          calm
            ? "bg-[linear-gradient(to_bottom,var(--color-ink)_0%,transparent_22%,transparent_62%,var(--color-ink)_100%)]"
            : "bg-[linear-gradient(to_bottom,var(--color-ink)_0%,transparent_24%,transparent_50%,var(--color-ink)_88%)]"
        }`}
      />
    </div>
  );
}
