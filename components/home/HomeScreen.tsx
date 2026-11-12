"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Phone, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ARRIVAL_WAIT, ArrivalOverlay } from "@/components/auth/ArrivalOverlay";
import { LoginScene } from "@/components/auth/LoginScene";
import { useTrip } from "@/lib/store";
import { IconButton } from "@/components/ui/Button";
import { LoginScreen } from "./LoginScreen";
import { PlanButton } from "./PlanButton";
import { RouteList } from "./RouteList";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSheet,
  SettingsToggle,
} from "./SettingsSheet";

export function HomeScreen() {
  const { status, user, signOut, arrival, clearArrival } = useAuth();
  const setRouteId = useTrip((s) => s.setRouteId);
  const autoSave = useTrip((s) => s.autoSave);
  const setAutoSave = useTrip((s) => s.setAutoSave);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const name = user?.displayName?.split(" ")[0];

  return (
    <main
      className="relative flex h-full flex-col pt-[calc(env(safe-area-inset-top)+16px)]"
      style={
        arrival
          ? ({ "--rise-wait": `${ARRIVAL_WAIT}s` } as React.CSSProperties)
          : undefined
      }
    >
      <div className="absolute inset-0">
        <LoginScene calm />
      </div>

      {arrival && (
        <ArrivalOverlay
          kind={arrival.kind}
          name={user?.displayName}
          onDone={clearArrival}
        />
      )}

      <header className="relative flex items-center justify-between gap-3 px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ochre">
          Outback Safe
        </p>
        <IconButton label="Settings" onClick={() => setSettingsOpen(true)}>
          <Settings size={18} strokeWidth={1.5} />
        </IconButton>
      </header>

      <div className="scroll-y relative min-h-0 flex-1 px-6 pb-6 pt-8">
        {name && (
          <p className="rise mb-3 text-[14px] text-bone-dim">Hello, {name}.</p>
        )}
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
          className="rise mt-3 flex h-14 items-center justify-center gap-2 rounded-full border border-rust/50 bg-ink/50 text-[16px] text-bone backdrop-blur-md transition-colors duration-200 active:bg-rust/15"
        >
          <Phone size={18} strokeWidth={1.5} className="text-rust" />
          Emergency: call 000 and first aid
        </Link>

        <div className="rise mt-10" style={{ "--i": 3 } as React.CSSProperties}>
          {status === "signedIn" && user ? (
            <RouteList uid={user.uid} />
          ) : (
            <p className="rounded-[24px] border border-dashed border-bone/15 bg-ink/50 px-5 py-5 text-[13px] leading-relaxed text-bone-faint backdrop-blur-md">
              Accounts are not set up yet, so routes cannot be saved. You can
              still plan trips and see hazards.
            </p>
          )}
        </div>
      </div>
      <div className="pb-safe" />

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        {status === "signedIn" && (
          <>
            <SettingsGroup title="Routes">
              <SettingsToggle
                title="Auto-save routes"
                description="Save changes while you plan, no button needed."
                checked={autoSave}
                onChange={setAutoSave}
              />
            </SettingsGroup>
            <SettingsGroup title="Account">
              <SettingsRow>
                <p className="text-[13px] text-bone-dim">Signed in as</p>
                <p className="mb-3 truncate text-[16px] text-bone">
                  {user?.displayName ?? user?.email}
                </p>
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    setRouteId(null);
                    void signOut();
                  }}
                  className="flex h-11 items-center gap-2 rounded-full border border-rust/50 px-5 text-[15px] text-bone active:bg-rust/15"
                >
                  <LogOut size={16} strokeWidth={1.5} className="text-rust" />
                  Sign out
                </button>
              </SettingsRow>
            </SettingsGroup>
          </>
        )}
        <SettingsGroup title="About">
          <SettingsRow>
            <p className="text-[14px] leading-relaxed text-bone-dim">
              Outback Safe is a school project about Australia. Hazard
              information is a guide based on public sources, not official
              safety advice. In an emergency call 000.
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-bone-faint">
              Map data © OpenStreetMap contributors, © CARTO. Place photos from
              Wikimedia Commons, credited under each photo.
            </p>
          </SettingsRow>
        </SettingsGroup>
      </SettingsSheet>
    </main>
  );
}
