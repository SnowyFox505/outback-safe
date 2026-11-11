"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ExternalLink, Phone } from "lucide-react";
import emergencyData from "@/data/emergency.json";
import { IconButton } from "@/components/ui/Button";

interface Source {
  name: string;
  url: string;
}
interface Tip {
  id: string;
  title: string;
  steps: string[];
  sources: Source[];
}

const { emergency, tips } = emergencyData as {
  emergency: typeof emergencyData.emergency;
  tips: Tip[];
};

function SourceLinks({ sources }: { sources: Source[] }) {
  return (
    <ul className="space-y-1">
      {sources.map((s) => (
        <li key={s.url}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[32px] items-center gap-1.5 text-[13px] text-sea active:underline"
          >
            {s.name}
            <ExternalLink size={12} strokeWidth={1.5} />
          </a>
        </li>
      ))}
    </ul>
  );
}

function TipCard({ tip }: { tip: Tip }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[22px] border border-bone/[0.07] bg-char-800">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[64px] w-full items-center justify-between gap-3 px-5 text-left"
      >
        <span className="text-[16px] font-medium text-bone">{tip.title}</span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={`shrink-0 text-bone-dim transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="space-y-4 px-5 pb-5">
          <ol className="space-y-3">
            {tip.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-[15px] leading-relaxed text-bone">
                <span className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ochre/15 font-mono text-[12px] text-ochre">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
              Sources
            </p>
            <SourceLinks sources={tip.sources} />
          </div>
        </div>
      )}
    </div>
  );
}

export function EmergencyScreen() {
  const router = useRouter();

  return (
    <main className="flex h-full flex-col pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="flex items-center gap-3 px-4">
        <IconButton
          label="Back"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </IconButton>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ochre">
          Emergency
        </p>
      </header>

      <div className="scroll-y min-h-0 flex-1 space-y-8 px-5 pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        <section>
          <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-bone">
            In an emergency, call&nbsp;{emergency.number}.
          </h1>
          <a
            href={`tel:${emergency.number}`}
            className="mt-5 flex h-16 items-center justify-center gap-3 rounded-full bg-rust text-[19px] font-semibold text-bone transition-colors duration-200 active:brightness-90"
          >
            <Phone size={22} strokeWidth={1.75} />
            Call {emergency.number}
          </a>
          <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-bone-dim">
            <p>{emergency.whenToCall}</p>
            <p>{emergency.whatToSay}</p>
            <p>{emergency.mobileNote}</p>
            <p>{emergency.appNote}</p>
            <p>
              For something urgent but not an emergency, call the Police
              Assistance Line on{" "}
              <a
                href={`tel:${emergency.policeAssistanceLine.replace(/\s/g, "")}`}
                className="text-bone underline underline-offset-2"
              >
                {emergency.policeAssistanceLine}
              </a>
              .
            </p>
          </div>
          <div className="mt-3">
            <SourceLinks sources={emergency.sources} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
            First aid tips
          </h2>
          <div className="space-y-2.5">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        </section>

        <p className="rounded-[20px] bg-bone/[0.04] px-4 py-3 text-[12px] leading-relaxed text-bone-faint">
          These tips are a short guide, not a replacement for a first aid course
          or for the advice of emergency services. Call 000 first.
        </p>
      </div>
    </main>
  );
}
