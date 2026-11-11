"use client";

import { motion } from "motion/react";

/** Each page fades in. Opacity only, so fixed and absolute children keep working. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
