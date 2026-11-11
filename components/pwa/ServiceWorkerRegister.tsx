"use client";

import { useEffect } from "react";

/** Registers the service worker (production only) and blocks pinch-zoom on iOS. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // iOS Safari ignores user-scalable=no, so stop its pinch-zoom gesture here.
    // The map zooms through touch events, which this does not affect.
    const stopGesture = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", stopGesture);

    let cancelled = false;
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(async () => {
          const reg = await navigator.serviceWorker.ready;
          if (cancelled || !reg.active) return;
          // Tell the worker which scripts and styles this page already loaded.
          const urls = performance
            .getEntriesByType("resource")
            .map((e) => new URL(e.name))
            .filter((u) => u.origin === location.origin)
            .map((u) => u.pathname + u.search);
          reg.active.postMessage({ type: "CACHE_URLS", urls });
        })
        .catch(() => {
          // Offline support is a bonus. The app works without it.
        });
    }

    return () => {
      cancelled = true;
      document.removeEventListener("gesturestart", stopGesture);
    };
  }, []);

  return null;
}
