import { PlanButton } from "@/components/home/PlanButton";

export default function Home() {
  return (
    <main className="flex h-full flex-col justify-between px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-[calc(env(safe-area-inset-top)+40px)]">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ochre">
          Outback Safe
        </p>
        <h1 className="mt-4 font-display text-[44px] font-semibold leading-[1.02] tracking-tight text-bone">
          Know the road before you go.
        </h1>
        <p className="mt-4 max-w-[30ch] text-[16px] leading-relaxed text-bone-dim">
          Plan an Australian road trip and see which hazards wait on your route,
          month by month.
        </p>
      </div>
      <PlanButton />
    </main>
  );
}
