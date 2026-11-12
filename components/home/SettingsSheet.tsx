"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/Button";

const SOFT = [0.22, 0.8, 0.28, 1] as const;

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Settings drawer that rises from the bottom. Put groups inside it with
 * SettingsGroup, so new settings only need a new row. Swipe down, tap the
 * backdrop or press Escape to close.
 */
export function SettingsSheet({ open, onClose, children }: SettingsSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.38, ease: SOFT }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88%] w-full max-w-[560px] overflow-y-auto rounded-t-[32px] border-t border-bone/10 bg-char-900 px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-2.5 shadow-[var(--shadow-sheet)]"
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-bone/20" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-[26px] font-semibold leading-none text-bone">
                Settings
              </h2>
              <IconButton label="Close settings" onClick={onClose}>
                <X size={18} strokeWidth={1.5} />
              </IconButton>
            </div>
            <div className="space-y-7">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A titled block of settings rows. */
export function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title}>
      <h3 className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
        {title}
      </h3>
      <div className="divide-y divide-bone/[0.06] overflow-hidden rounded-[24px] border border-bone/[0.07] bg-char-800">
        {children}
      </div>
    </section>
  );
}

/** A switch row with a title and a short description. */
export function SettingsToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-[68px] w-full items-center justify-between gap-4 px-5 py-3 text-left"
    >
      <span>
        <span className="block text-[16px] text-bone">{title}</span>
        <span className="block text-[13px] leading-snug text-bone-dim">{description}</span>
      </span>
      <span
        aria-hidden
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-ochre" : "bg-bone/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/** A plain row, for text or a button. */
export function SettingsRow({ children }: { children: ReactNode }) {
  return <div className="px-5 py-4">{children}</div>;
}
