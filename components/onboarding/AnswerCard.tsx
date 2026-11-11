"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { Option } from "@/lib/questions";

interface AnswerCardProps {
  option: Option;
  selected: boolean;
  onSelect: () => void;
  /** Compact tile for month and grid layouts. */
  compact?: boolean;
  /** Multi-select cards show a checkbox so it is clear more than one can be picked. */
  multi?: boolean;
  /** Position in the list, used to stagger the entrance. */
  index?: number;
}

/** Large tap target for onboarding answers. */
export function AnswerCard({
  option,
  selected,
  onSelect,
  compact,
  multi,
  index = 0,
}: AnswerCardProps) {
  const Icon = option.icon;
  return (
    <motion.button
      onClick={onSelect}
      aria-pressed={selected}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index, 10) * 0.04,
        ease: [0.22, 0.8, 0.28, 1],
      }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex w-full text-left transition-colors duration-200 ${
        compact
          ? "min-h-[84px] flex-col justify-between rounded-[22px] p-3.5"
          : "min-h-[64px] items-center gap-4 rounded-[24px] px-5 py-3"
      } ${
        selected
          ? "border border-ochre bg-ochre/[0.12]"
          : "border border-bone/[0.08] bg-char-800 active:bg-char-700"
      }`}
    >
      {Icon && (
        <Icon
          size={compact ? 22 : 24}
          strokeWidth={1.5}
          className={selected ? "text-ochre" : "text-bone-dim"}
        />
      )}
      <span className={compact ? "block" : "block flex-1"}>
        <span
          className={`block font-medium text-bone ${
            compact && !Icon ? "font-display text-[22px]" : "text-[16px]"
          }`}
        >
          {option.label}
        </span>
        {option.hint && (
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
            {option.hint}
          </span>
        )}
      </span>
      {multi ? (
        <span
          aria-hidden
          className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border transition-colors duration-200 ${
            compact ? "absolute right-3 top-3" : ""
          } ${
            selected ? "border-ochre bg-ochre" : "border-bone/25"
          }`}
        >
          {selected && (
            <motion.span
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 22 }}
              className="grid place-items-center"
            >
              <Check size={14} strokeWidth={2.5} className="text-ink" />
            </motion.span>
          )}
        </span>
      ) : (
        selected && (
          <motion.span
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
            className={compact ? "absolute right-3 top-3" : ""}
          >
            <Check size={16} strokeWidth={2} className="text-ochre" />
          </motion.span>
        )
      )}
    </motion.button>
  );
}
