"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import type { Severity } from "@/lib/types";
import { severityColor } from "@/components/ui/SeverityBadge";

/** Progress ring for the route risk score. Colour follows the highest hazard level. */
export function RiskRing({
  score,
  level,
  size = 76,
}: {
  score: number;
  level: Severity | 0;
  size?: number;
}) {
  // The ring and the number count up together, from wherever they were.
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? score : 0);
  const from = useRef(reduce ? score : 0);
  useEffect(() => {
    const controls = animate(from.current, score, {
      duration: reduce ? 0 : 1,
      ease: [0.22, 0.8, 0.28, 1],
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [score, reduce]);

  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = level ? severityColor[level] : "var(--color-bone-faint)";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Risk score ${score} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={stroke}
          className="text-bone"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          style={{ transition: "stroke 400ms var(--ease-soft)" }}
        />
      </svg>
      <span className="tabular absolute inset-0 grid place-items-center font-mono text-[17px] font-medium text-bone">
        {Math.round(shown)}
      </span>
    </div>
  );
}
