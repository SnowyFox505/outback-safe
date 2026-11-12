/* Outback Safe service worker (hand-written, no libraries).
 *
 * - Pages: network first, so you always get the newest version online.
 *   When offline the last cached copy opens instead.
 * - /_next/static files, icons and map worker files: cache first. Their URLs
 *   contain a content hash, so a cached copy is never out of date.
 * - Everything cross-origin (Firebase, map tiles) is left alone.
 *
 * Bump VERSION to drop all old caches.
 */
const VERSION = "v4";
const SHELL_CACHE = `outback-shell-${VERSION}`;
const ASSET_CACHE = `outback-assets-${VERSION}`;

// Pages to keep available offline.
const PAGES = ["/", "/plan/onboarding", "/plan/map", "/emergency"];

const STATIC_FILES = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/maplibre-gl-worker.mjs",
  "/maplibre-gl-shared.mjs",
];

/**
 * Finds static file URLs inside a page or script. Pages list their scripts as
 * /_next/static/..., while scripts reference lazy-loaded chunks as static/chunks/...
 */
const REF = /(?:\/_next\/)?static\/(?:chunks|media)\/[^"'`\s\\)(,]+?\.(?:js|css|woff2?|png|svg|ico)/g;

function refsIn(text) {
  const found = text.match(REF) || [];
  return [
    ...new Set(
      found.map((u) => (u.startsWith("/_next/") ? u : "/_next/" + u)),
    ),
  ];
}

/** Caches a file and every file it points to, up to a sane limit. */
async function cacheTree(cache, startUrls, limit = 250) {
  const seen = new Set();
  const queue = [...startUrls];
  while (queue.length && seen.size < limit) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      let response = await cache.match(url);
      if (!response) {
        response = await fetch(url);
        if (!response.ok) continue;
        await cache.put(url, response.clone());
      }
      if (/\.(js|css)$/.test(url)) {
        for (const next of refsIn(await response.text())) {
          if (!seen.has(next)) queue.push(next);
        }
      }
    } catch {
      // One missing file must not stop the rest.
    }
  }
}

async function warm() {
  const shell = await caches.open(SHELL_CACHE);
  const assets = await caches.open(ASSET_CACHE);

  await Promise.allSettled(STATIC_FILES.map((url) => assets.add(url)));

  const starts = [];
  await Promise.allSettled(
    PAGES.map(async (page) => {
      const response = await fetch(page, { cache: "reload" });
      if (!response.ok) return;
      await shell.put(page, response.clone());
      starts.push(...refsIn(await response.text()));
    }),
  );
  await cacheTree(assets, [...new Set(starts)]);
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(warm());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
      for (const key of await caches.keys()) {
        if (key.startsWith("outback-") && !keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

// The page can ask us to cache what it has already loaded.
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "CACHE_URLS") return;
  event.waitUntil(
    (async () => {
      const assets = await caches.open(ASSET_CACHE);
      await cacheTree(
        assets,
        event.data.urls.filter(
          (u) => u.startsWith("/_next/static/") || u.startsWith("/icons/"),
        ),
      );
    })(),
  );
});

async function networkFirst(request) {
  const shell = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) shell.put(request, response.clone());
    return response;
  } catch {
    const cached = await shell.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const home = await shell.match("/");
    if (home) return home;
    return new Response("You are offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const assets = await caches.open(ASSET_CACHE);
  const cached = await assets.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) assets.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Firebase sign-in helper and API routes must always hit the network.
  if (url.pathname.startsWith("/__/") || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    // Place photos are cached as you look at them, so they work offline later.
    url.pathname.startsWith("/places/") ||
    url.pathname.startsWith("/maplibre-gl-") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(cacheFirst(request));
  }
});
