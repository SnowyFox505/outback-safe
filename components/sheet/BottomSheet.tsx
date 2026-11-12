"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { animate, motion, useDragControls, useMotionValue } from "motion/react";

export type Snap = "peek" | "half" | "full";

const HEADER_H = 108;
const PEEK_VISIBLE = 116;
const TOP_GAP = 76;

interface BottomSheetProps {
  snap: Snap;
  onSnapChange: (snap: Snap) => void;
  /** Always visible, doubles as the drag handle. */
  header: ReactNode;
  children: ReactNode;
  /** Reports how many pixels of the sheet are on screen. */
  onVisibleChange?: (visible: number) => void;
}

const reduce = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Draggable bottom sheet with three snap points, in the style of Apple Maps.
 * Only the header drags, so the content below can scroll freely.
 */
export function BottomSheet({
  snap,
  onSnapChange,
  header,
  children,
  onVisibleChange,
}: BottomSheetProps) {
  const [viewportH, setViewportH] = useState(800);
  const controls = useDragControls();
  const y = useMotionValue(0);

  useLayoutEffect(() => {
    const update = () => setViewportH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sheetH = viewportH - TOP_GAP;
  const visibleFor: Record<Snap, number> = {
    peek: PEEK_VISIBLE,
    half: Math.round(viewportH * 0.5),
    full: sheetH,
  };
  const targetY = (s: Snap) => sheetH - visibleFor[s];

  useEffect(() => {
    animate(y, targetY(snap), {
      duration: reduce() ? 0 : 0.3,
      ease: [0.22, 0.8, 0.28, 1],
    });
    onVisibleChange?.(visibleFor[snap]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, sheetH]);

  function settle(velocityY: number) {
    const projected = y.get() + velocityY * 0.18;
    let best: Snap = snap;
    let bestDist = Infinity;
    (Object.keys(visibleFor) as Snap[]).forEach((s) => {
      const d = Math.abs(targetY(s) - projected);
      if (d < bestDist) {
        best = s;
        bestDist = d;
      }
    });
    if (best === snap) {
      animate(y, targetY(best), { duration: reduce() ? 0 : 0.25 });
    } else {
      onSnapChange(best);
    }
  }

  const contentH = Math.max(0, visibleFor[snap] - HEADER_H);

  return (
    <motion.section
      aria-label="Route and hazards"
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ top: 0, bottom: targetY("peek") }}
      dragElastic={0.04}
      dragMomentum={false}
      onDragEnd={(_, info) => settle(info.velocity.y)}
      style={{ y, height: sheetH }}
      className="absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-[560px] flex-col rounded-t-[32px] border-t border-bone/10 bg-char-900 shadow-[var(--shadow-sheet)]"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="shrink-0 cursor-grab touch-none px-5 pt-2.5"
        style={{ height: HEADER_H }}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-bone/20" />
        {header}
      </div>
      <div
        className={`scroll-y min-h-0 px-5 transition-[height] duration-300 ${
          snap === "peek" ? "overflow-hidden" : ""
        }`}
        style={{ height: contentH }}
      >
        <div className="pb-[calc(env(safe-area-inset-bottom)+32px)]">
          {children}
        </div>
      </div>
    </motion.section>
  );
}
