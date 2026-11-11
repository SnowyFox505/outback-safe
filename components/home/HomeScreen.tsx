"use client";

import Link from "next/link";
import { LogOut, Phone } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTrip } from "@/lib/store";
import { IconButton } from "@/components/ui/Button";
import { LoginScreen } from "./LoginScreen";
import { PlanButton } from "./PlanButton";
import { RouteList } from "./RouteList";

export function HomeScreen() {
  const { status, user, signOut } = useAuth();
  const setRouteId = useTrip((s) => s.setRouteId);
  const autoSave = useTrip((s) => s.autoSave);
  const setAutoSave = useTrip((s) => s.setAutoSave);

  if (status === "loading") {
    return (
      <main className="grid h-full place-items-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-faint">
          Outback Safe
        </p>
      </main>
    );
  }

  if (status === "signedOut") return <LoginScreen />;

  const firstName =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0];

  return (
    <main className="flex h-full flex-col pt-[calc(env(safe-area-inset-top)+16px)]">
      <header className="flex items-center justify-between gap-3 px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ochre">
          Outback Safe
        </p>
        {status === "signedIn" && (
          <div className="flex items-center gap-2">
            {firstName && (
              <span className="text-[13px] text-bone-dim">{firstName}</span>
            )}
            <IconButton label="Sign out" onClick={() => {
                setRouteId(null);
                void signOut();
              }}>
              <LogOut size={18} strokeWidth={1.5} />
            </IconButton>
          </div>
        )}
      </header>

      <div className="scroll-y min-h-0 flex-1 px-6 pb-6 pt-8">
        <h1 className="rise font-display text-[40px] font-semibold leading-[1.04] tracking-tight text-bone">
          Know the road before you go.
        </h1>
        <p className="rise mt-3 max-w-[30ch] text-[15px] leading-relaxed text-bone-dim">
          Plan an Australian road trip and see which hazards wait on your route,
          month by month.
        </p>

        <div className="rise mt-8" style={{ "--i": 1 } as React.CSSProperties}>
          <PlanButton />
        </div>

        <Link
          href="/emergency"
          style={{ "--i": 2 } as React.CSSProperties}
          className="rise mt-3 flex h-14 items-center justify-center gap-2 rounded-full border border-rust/50 text-[16px] text-bone transition-colors duration-200 active:bg-rust/15"
        >
          <Phone size={18} strokeWidth={1.5} className="text-rust" />
          Emergency: call 000 and first aid
        </Link>

        <div className="rise mt-10" style={{ "--i": 3 } as React.CSSProperties}>
          {status === "signedIn" && user ? (
            <RouteList uid={user.uid} />
          ) : (
            <p className="rounded-[24px] border border-dashed border-bone/15 px-5 py-5 text-[13px] leading-relaxed text-bone-faint">
              Accounts are not set up yet, so routes cannot be saved. You can
              still plan trips and see hazards.
            </p>
          )}
        </div>

        {status === "signedIn" && (
          <section className="rise mt-10" style={{ "--i": 4 } as React.CSSProperties} aria-labelledby="settings">
            <h2
              id="settings"
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint"
            >
              Settings
            </h2>
            <button
              role="switch"
              aria-checked={autoSave}
              onClick={() => setAutoSave(!autoSave)}
              className="flex min-h-[64px] w-full items-center justify-between gap-4 rounded-[24px] border border-bone/[0.07] bg-char-800 px-5 text-left"
            >
              <span>
                <span className="block text-[16px] text-bone">Auto-save routes</span>
                <span className="block text-[13px] text-bone-dim">
                  Save changes while you plan, no button needed.
                </span>
              </span>
              <span
                aria-hidden
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                  autoSave ? "bg-ochre" : "bg-bone/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    autoSave ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </section>
        )}
      </div>
      <div className="pb-safe" />
    </main>
  );
}
