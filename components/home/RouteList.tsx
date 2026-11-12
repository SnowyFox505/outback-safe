"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteRoute, renameRoute, routeSummary, subscribeRoutes } from "@/lib/routes";
import type { SavedRoute } from "@/lib/routes";
import { useTrip } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { MiniRoute } from "@/components/ui/MiniRoute";

export function RouteList({ uid }: { uid: string }) {
  const router = useRouter();
  const loadRoute = useTrip((s) => s.loadRoute);
  const currentId = useTrip((s) => s.routeId);
  const setRouteId = useTrip((s) => s.setRouteId);

  const [routes, setRoutes] = useState<SavedRoute[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<SavedRoute | null>(null);
  const [deleting, setDeleting] = useState<SavedRoute | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(
    () => subscribeRoutes(uid, setRoutes, setError),
    [uid],
  );

  async function confirmRename() {
    if (!renaming) return;
    const name = draft.trim().slice(0, 80);
    if (!name) return;
    setBusy(true);
    try {
      await renameRoute(uid, renaming.id, name);
      setRenaming(null);
    } catch {
      setError("Could not rename the route. Please try again.");
    }
    setBusy(false);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteRoute(uid, deleting.id);
      if (currentId === deleting.id) setRouteId(null);
      setDeleting(null);
    } catch {
      setError("Could not delete the route. Please try again.");
    }
    setBusy(false);
  }

  return (
    <section aria-labelledby="my-routes">
      <h2
        id="my-routes"
        className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint"
      >
        My routes
      </h2>

      {error && (
        <p role="alert" className="mb-3 text-[13px] text-hz-3">
          {error}
        </p>
      )}

      {routes === null ? (
        <div className="h-[80px] animate-pulse rounded-[24px] bg-char-800" />
      ) : routes.length === 0 ? (
        <p className="rounded-[24px] border border-dashed border-bone/15 bg-ink/50 px-5 py-6 text-[14px] leading-relaxed text-bone-dim backdrop-blur-md">
          No saved routes yet. Plan a trip, then tap the save button on the map.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {routes.map((r, i) => (
            <li
              key={r.id}
              style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
              className="rise flex items-center gap-1 rounded-[24px] border border-bone/[0.07] bg-char-800/90 pr-1.5 backdrop-blur-md"
            >
              <button
                onClick={() => {
                  loadRoute(r);
                  router.push("/plan/map");
                }}
                className="flex min-h-[80px] min-w-0 flex-1 items-center gap-4 px-4 py-3 text-left"
              >
                <MiniRoute stops={r.stops} className="h-[46px] w-[52px] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-medium text-bone">
                    {r.name}
                  </span>
                  <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-bone-faint">
                    {routeSummary(r)}
                  </span>
                </span>
              </button>
              <button
                aria-label={`Rename ${r.name}`}
                onClick={() => {
                  setDraft(r.name);
                  setRenaming(r);
                }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-bone-dim active:bg-bone/[0.08]"
              >
                <Pencil size={18} strokeWidth={1.5} />
              </button>
              <button
                aria-label={`Delete ${r.name}`}
                onClick={() => setDeleting(r)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-bone-dim active:bg-bone/[0.08]"
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={!!renaming}
        title="Rename route"
        onClose={() => setRenaming(null)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirmRename();
          }}
          className="space-y-4"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={80}
            autoFocus
            aria-label="Route name"
            className="h-12 w-full rounded-[16px] border border-bone/10 bg-ink px-4 text-[16px] text-bone outline-none focus:border-ochre"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="glass"
              className="flex-1"
              onClick={() => setRenaming(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={busy || !draft.trim()}
            >
              Save
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={!!deleting}
        title="Delete route?"
        onClose={() => setDeleting(null)}
      >
        <p className="mb-5 text-[15px] leading-relaxed text-bone-dim">
          &ldquo;{deleting?.name}&rdquo; will be deleted. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="glass"
            className="flex-1"
            onClick={() => setDeleting(null)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 !bg-rust !text-bone"
            disabled={busy}
            onClick={() => void confirmDelete()}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
