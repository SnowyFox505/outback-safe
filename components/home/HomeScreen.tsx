"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTrip } from "@/lib/store";
import { IconButton } from "@/components/ui/Button";
import { LoginScreen } from "./LoginScreen";
import { PlanButton } from "./PlanButton";
import { RouteList } from "./RouteList";

export function HomeScreen() {
  const { status, user, signOut } = useAuth();
  const setRouteId = useTrip((s) => s.setRouteId);

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

  const firstName = user?.displayName?.split(" ")[0];

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
        <h1 className="font-display text-[40px] font-semibold leading-[1.04] tracking-tight text-bone">
          Know the road before you go.
        </h1>
        <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-bone-dim">
          Plan an Australian road trip and see which hazards wait on your route,
          month by month.
        </p>

        <div className="mt-8">
          <PlanButton />
        </div>

        <div className="mt-10">
          {status === "signedIn" && user ? (
            <RouteList uid={user.uid} />
          ) : (
            <p className="rounded-[24px] border border-dashed border-bone/15 px-5 py-5 text-[13px] leading-relaxed text-bone-faint">
              Accounts are not set up yet, so routes cannot be saved. You can
              still plan trips and see hazards.
            </p>
          )}
        </div>
      </div>
      <div className="pb-safe" />
    </main>
  );
}
