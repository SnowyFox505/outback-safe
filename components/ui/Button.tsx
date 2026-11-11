"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "glass" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-ochre text-ink font-semibold active:bg-ochre-deep disabled:bg-char-700 disabled:text-bone-faint",
  glass:
    "bg-bone/[0.07] text-bone border border-bone/10 backdrop-blur-md active:bg-bone/[0.12] disabled:opacity-40",
  ghost: "text-bone-dim active:text-bone disabled:opacity-40",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", ...props },
    ref,
  ) {
    const height = size === "lg" ? "h-14 px-7 text-[17px]" : "h-12 px-5 text-[15px]";
    return (
      <button
        ref={ref}
        {...props}
        className={`inline-flex min-w-[44px] items-center justify-center gap-2 rounded-full transition-colors duration-200 ${height} ${variants[variant]} ${className}`}
      />
    );
  },
);

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

/** Round 44px+ icon button for map and sheet chrome. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        aria-label={label}
        {...props}
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-bone/10 bg-ink/70 text-bone backdrop-blur-md transition-colors duration-200 active:bg-char-700 disabled:opacity-40 ${className}`}
      />
    );
  },
);
