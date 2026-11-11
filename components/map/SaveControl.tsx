"use client";

import Link from "next/link";
import { Check, Cloud, CloudOff, Loader2, Save } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { SaveState } from "@/lib/useRouteSaver";

interface SaveControlProps {
  state: SaveState;
  autoSave: boolean;
  signedIn: boolean;
  canSave: boolean;
  routeId: string | null;
  hasStops: boolean;
  onSave: () => void;
}

const pill =
  "flex h-11 items-center gap-2 rounded-full border border-bone/10 bg-ink/70 px-4 text-[13px] text-bone backdrop-blur-md";

/** Top-bar save status: shows auto-save progress, or a Save button when auto-save is off. */
export function SaveControl({
  state,
  autoSave,
  signedIn,
  canSave,
  routeId,
  hasStops,
  onSave,
}: SaveControlProps) {
  if (!isFirebaseConfigured) return null;

  if (!signedIn) {
    return (
      <Link href="/" className={`${pill} active:bg-char-700`}>
        <CloudOff size={16} strokeWidth={1.5} className="text-bone-dim" />
        Sign in to save
      </Link>
    );
  }

  if (state === "error") {
    return (
      <button
        onClick={onSave}
        className={`${pill} text-hz-3 active:bg-char-700`}
      >
        <CloudOff size={16} strokeWidth={1.5} />
        Not saved · Retry
      </button>
    );
  }

  if (autoSave) {
    return (
      <span className={pill} role="status" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={
              state === "saving"
                ? "saving"
                : state === "saved" || (routeId && hasStops)
                  ? "saved"
                  : "idle"
            }
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2"
          >
            {state === "saving" ? (
              <>
                <Loader2
                  size={16}
                  strokeWidth={1.5}
                  className="animate-spin text-bone-dim"
                />
                Saving
              </>
            ) : state === "saved" || (routeId && hasStops) ? (
              <>
                <Check size={16} strokeWidth={2} className="text-ochre" />
                Saved
              </>
            ) : (
              <>
                <Cloud size={16} strokeWidth={1.5} className="text-bone-dim" />
                Auto-save
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }

  return (
    <button
      onClick={onSave}
      disabled={!canSave || state === "saving"}
      aria-label={routeId ? "Update saved route" : "Save route"}
      className={`${pill} transition-colors duration-200 active:bg-char-700 disabled:opacity-40`}
    >
      {state === "saved" ? (
        <Check size={16} strokeWidth={2} className="text-ochre" />
      ) : (
        <Save size={16} strokeWidth={1.5} />
      )}
      {state === "saving"
        ? "Saving"
        : state === "saved"
          ? "Saved"
          : routeId
            ? "Update"
            : "Save"}
    </button>
  );
}
