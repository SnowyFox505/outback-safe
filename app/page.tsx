import Link from "next/link";
import { Map as MapIcon } from "lucide-react";

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
      <div className="space-y-3">
        <Link
          href="/plan/map"
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-ochre text-[17px] font-semibold text-ink active:bg-ochre-deep"
        >
          <MapIcon size={19} strokeWidth={1.75} />
          Plan a new trip
        </Link>
      </div>
    </main>
  );
}
