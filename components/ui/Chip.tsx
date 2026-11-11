"use client";

import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Selectable pill used for month and filter pickers. 44px minimum height. */
export function Chip({ active, className = "", ...props }: ChipProps) {
  return (
    <button
      aria-pressed={active}
      {...props}
      className={`inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-full border px-4 font-mono text-[12px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 ${
        active
          ? "border-ochre bg-ochre text-ink"
          : "border-bone/10 bg-bone/[0.05] text-bone-dim active:bg-bone/[0.1]"
      } ${className}`}
    />
  );
}
