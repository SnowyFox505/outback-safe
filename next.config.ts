import type { NextConfig } from "next";

const firebaseProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The service worker must never be served from a stale cache.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  // Serve Firebase's sign-in helper from our own domain. Safari blocks the
  // third-party storage that the default firebaseapp.com handler needs, so the
  // auth domain is set to our own domain and these paths are proxied.
  async rewrites() {
    if (!firebaseProject) return [];
    const target = `https://${firebaseProject}.firebaseapp.com`;
    return [
      { source: "/__/auth/:path*", destination: `${target}/__/auth/:path*` },
      {
        source: "/__/firebase/init.json",
        destination: `${target}/__/firebase/init.json`,
      },
    ];
  },
};

export default nextConfig;
