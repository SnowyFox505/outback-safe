"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { categoryLabel } from "@/lib/data";
import type { Hazard } from "@/lib/types";
import { SeverityBadge, SeverityDot } from "@/components/ui/SeverityBadge";

/** Expandable hazard row: name and level up front, details on tap. */
export function HazardCard({
  hazard,
  boosted = false,
  kids = false,
}: {
  hazard: Hazard;
  /** True when this hazard counts for more because you are camping. */
  boosted?: boolean;
  /** True when children are coming, so child advice is shown. */
  kids?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const kidsNote = kids ? hazard.kidsNote : undefined;

  return (
    <div className="rounded-[20px] border border-bone/[0.07] bg-char-800">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left"
      >
        <SeverityDot severity={hazard.severity} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-bone">
            {hazard.name}
          </span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
            {categoryLabel[hazard.category]}
            {boosted && " · Higher when camping"}
            {kidsNote && " · Advice for kids"}
          </span>
        </span>
        <SeverityBadge severity={hazard.severity} />
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={`shrink-0 text-bone-dim transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.8, 0.28, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-4 pb-4 text-[14px] leading-relaxed text-bone-dim">
              <p>{hazard.description}</p>
              {boosted && (
                <p className="rounded-[14px] bg-ochre/10 px-3 py-2 text-[13px] text-bone">
                  This counts for more on your trip because you will be sleeping
                  in a campsite, tent or campervan.
                </p>
              )}
              {kidsNote && (
                <div className="rounded-[14px] border border-sea/30 bg-sea/10 px-3 py-2.5">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sea">
                    With children
                  </p>
                  <p className="text-[13px] text-bone">{kidsNote.text}</p>
                  <a
                    href={kidsNote.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex min-h-[28px] items-center gap-1.5 text-[12px] text-sea underline-offset-2 active:underline"
                  >
                    {kidsNote.source.name}
                    <ExternalLink size={11} strokeWidth={1.5} />
                  </a>
                </div>
              )}
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ochre">
                  What to do
                </p>
                <p className="text-bone">{hazard.whatToDo}</p>
              </div>
              {hazard.firstAid && (
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ochre">
                    First aid
                  </p>
                  <p className="text-bone">{hazard.firstAid}</p>
                </div>
              )}
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
                  Sources
                </p>
                <ul className="space-y-1">
                  {hazard.sources.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[32px] items-center gap-1.5 text-[13px] text-sea underline-offset-2 active:underline"
                      >
                        {s.name}
                        <ExternalLink size={12} strokeWidth={1.5} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
