"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { questions } from "@/lib/questions";
import type { Question } from "@/lib/questions";
import { useTrip } from "@/lib/store";
import type {
  Accommodation,
  Activity,
  Month,
  Transport,
  TripAnswers,
} from "@/lib/types";
import { Button, IconButton } from "@/components/ui/Button";
import { AnswerCard } from "./AnswerCard";
import { TripSummary } from "./TripSummary";

const TOTAL = questions.length;

function selectedIds(q: Question, trip: TripAnswers): string[] {
  switch (q.key) {
    case "month":
      return trip.month ? [String(trip.month)] : [];
    case "activities":
      return trip.activities;
    case "firstTime":
      return trip.firstTime === null ? [] : [trip.firstTime ? "first" : "before"];
    case "transport":
      return trip.transport;
    case "accommodation":
      return trip.accommodation ? [trip.accommodation] : [];
    case "duration":
      return trip.duration ? [trip.duration] : [];
    case "party":
      return trip.party ? [trip.party] : [];
  }
}

export function OnboardingFlow() {
  const router = useRouter();
  const { trip, setTrip, toggleActivity, toggleTransport } = useTrip();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const advanceTimer = useRef<number | undefined>(undefined);

  const isSummary = step >= TOTAL;
  const q = questions[step];

  function go(next: number) {
    window.clearTimeout(advanceTimer.current);
    setDir(next > step ? 1 : -1);
    setStep(Math.max(0, Math.min(TOTAL, next)));
  }

  function back() {
    if (step === 0) router.push("/");
    else go(step - 1);
  }

  function choose(question: Question, id: string) {
    switch (question.key) {
      case "month":
        setTrip({ month: Number(id) as Month });
        break;
      case "accommodation":
        setTrip({ accommodation: id as Accommodation });
        break;
      case "transport":
        toggleTransport(id as Transport);
        return; // multi-select: wait for Continue
      case "duration":
        setTrip({ duration: id });
        break;
      case "party":
        setTrip({ party: id });
        break;
      case "firstTime":
        setTrip({ firstTime: id === "first" });
        break;
      case "activities":
        toggleActivity(id as Activity);
        return; // multi-select: wait for Continue
    }
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => go(step + 1), 260);
  }

  return (
    <main className="flex h-full flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="flex items-center gap-3">
        <IconButton label="Back" onClick={back}>
          <ChevronLeft size={22} strokeWidth={1.5} />
        </IconButton>
        <div
          className="flex flex-1 gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL + 1}
          aria-valuenow={step + 1}
          aria-label="Progress"
        >
          {Array.from({ length: TOTAL + 1 }, (_, i) => (
            <span
              key={i}
              className="h-1 flex-1 overflow-hidden rounded-full bg-bone/10"
            >
              <span
                className="block h-full rounded-full bg-ochre transition-transform duration-300 origin-left"
                style={{ transform: `scaleX(${i <= step ? 1 : 0})` }}
              />
            </span>
          ))}
        </div>
        <div className="flex w-[52px] justify-end">
          {!isSummary && !q.required && (
            <button
              onClick={() => go(step + 1)}
              className="h-11 px-1 text-[14px] text-bone-dim active:text-bone"
            >
              Skip
            </button>
          )}
        </div>
      </header>

      <div className="relative mt-6 min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: 28 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 * dir }}
            transition={{ duration: 0.24, ease: [0.22, 0.8, 0.28, 1] }}
            className="scroll-y absolute inset-0"
          >
            {isSummary ? (
              <>
                <h1 className="font-display text-[32px] font-semibold leading-[1.05] tracking-tight text-bone">
                  Your trip at a glance
                </h1>
                <p className="mb-6 mt-2 text-[15px] text-bone-dim">
                  Check the details, then pick your stops on the map.
                </p>
                <TripSummary trip={trip} />
              </>
            ) : (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ochre">
                  Question {step + 1} of {TOTAL}
                </p>
                <h1 className="mt-2 font-display text-[32px] font-semibold leading-[1.05] tracking-tight text-bone">
                  {q.title}
                </h1>
                <p className="mb-6 mt-2 text-[15px] text-bone-dim">
                  {q.subtitle}
                </p>
                <div
                  className={
                    q.layout === "months"
                      ? "grid grid-cols-3 gap-2.5"
                      : q.layout === "grid"
                        ? "grid grid-cols-2 gap-2.5"
                        : "flex flex-col gap-2.5"
                  }
                >
                  {q.options.map((o) => (
                    <AnswerCard
                      key={o.id}
                      option={o}
                      compact={q.layout !== "list"}
                      multi={q.multi}
                      selected={selectedIds(q, trip).includes(o.id)}
                      onSelect={() => choose(q, o.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="pt-4">
        {isSummary ? (
          <Button
            size="lg"
            className="w-full"
            disabled={!trip.month}
            onClick={() => router.push("/plan/map")}
          >
            Confirm and open map
          </Button>
        ) : q.multi ? (
          <Button size="lg" className="w-full" onClick={() => go(step + 1)}>
            Continue
          </Button>
        ) : null}
      </footer>
    </main>
  );
}
