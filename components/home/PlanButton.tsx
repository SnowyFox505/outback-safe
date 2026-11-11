"use client";

import { useRouter } from "next/navigation";
import { Route } from "lucide-react";
import { useTrip } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

/** Starts a fresh trip. If a plan is in progress, also offers to continue it. */
export function PlanButton() {
  const router = useRouter();
  const hydrated = useHydrated();
  const reset = useTrip((s) => s.reset);
  const stopCount = useTrip((s) => s.stops.length);

  return (
    <div className="space-y-3">
      <button
        onClick={() => {
          reset();
          router.push("/plan/onboarding");
        }}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ochre text-[17px] font-semibold text-ink transition-[colors,transform] duration-200 active:scale-[0.98] active:bg-ochre-deep"
      >
        <Route size={19} strokeWidth={1.75} />
        Plan a new trip
      </button>
      {hydrated && stopCount > 0 && (
        <button
          onClick={() => router.push("/plan/map")}
          className="flex h-14 w-full items-center justify-center rounded-full border border-bone/10 bg-bone/[0.07] text-[16px] text-bone backdrop-blur-md active:bg-bone/[0.12]"
        >
          Continue your route · {stopCount} stop{stopCount === 1 ? "" : "s"}
        </button>
      )}
    </div>
  );
}
