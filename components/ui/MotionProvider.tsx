"use client";

import { MotionConfig } from "motion/react";

/** Honours the system "reduce motion" setting for every motion animation. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
