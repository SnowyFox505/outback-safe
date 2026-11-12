# Outback Safe

A mobile-first PWA for planning an Australian road trip and seeing which hazards
to expect on the route, depending on travel month, how you travel and what you
plan to do. Built as a school project about Australia.

**Not official safety advice.** Hazard information is a guide based on public
sources (listed on every hazard). Always follow local signs, rangers and
emergency services. In Australia the emergency number is **000**.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, MapLibre GL JS (CARTO dark
basemap), Framer Motion (`motion`), Firebase Auth + Firestore, deployed on
Vercel. Hazard and place data are static JSON in `data/`.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: only needed for sign-in and saving
npm run dev
```

Without the Firebase variables the app runs in guest mode: you can plan trips
and see hazards, but routes cannot be saved.

## How risk is calculated

1. For each stop we collect the hazards that are active in the chosen month.
2. Trip answers filter them: road hazards only apply if you drive (rental car,
   campervan or 4WD), and activity hazards only apply if they match what you
   plan to do. Unanswered questions never hide anything.
3. Each hazard adds its severity (1 low, 2 moderate, 3 high). Camping hazards add
   one extra point if you sleep in a campsite, tent or campervan.
4. The score compares the total with a busy trip of 30 points (capped at 100).
   The level is the highest severity found, so one high hazard always shows as High.

A route with one stop works the same way, there are just no legs.

### Comparing months

You can pick every month that works for you. Once the route has stops, the same
calculation runs for each of those months. The month with the lowest score is
marked "Best"; ties are broken by fewer high hazards, then fewer hazards in
total. If the best months are identical, no month is marked. For long trips you
can enter the number of weeks and an optional start date, but hazards are still
shown for one active month at a time (no multi-month span logic yet).

## Saving routes

Signed-in users get auto-save by default (the route saves about 1.5 seconds after
the last change). It can be switched off under Settings on the home screen, which
brings back the manual Save/Update button.

## Places, trails and photos

- Every place in `data/places.json` carries its own `sources`. Walk distances,
  times and grades are copied as the source states them, and anything a source
  does not give is left out rather than guessed.
- Pin coordinates come from Wikipedia and OpenStreetMap (ODbL). Day trips and
  walks only show on the map from a regional zoom on (about a quarter of the
  country), or when you open them from the "Ideas near" list. Pins that would
  overlap are thinned out: main places and route stops always stay, sights come
  before walks, and more pins appear the closer you zoom.
- Photos are free-licence files from Wikimedia Commons, downloaded with
  `node scripts/fetch-commons-image.mjs <placeId> "File:Title.jpg" "Alt text"`.
  The photographer, licence and file page are shown under each photo.
- Places that sit on the coast or near beaches carry sharks and rips from their
  region; inland walks list `skipHazards` so those are left out. Victoria has its
  own bushfire entry because its Fire Danger Period is declared by the CFA, not
  by the NSW Rural Fire Service.
- `node scripts/contact-sheet.mjs out.jpg` builds one overview image of all
  photos for a quick visual check.
- `suits` (who a place is good for) is our own editorial suggestion, not a source
  fact. Everything else on a place is copied from its sources.
- "Staying in" (base cities) and "Who is travelling" drive the suggestions. A
  place can name the groups it suits with `suits`; those come first.

## Firebase setup

1. Create a project in the [Firebase console](https://console.firebase.google.com).
2. Build > Authentication > Sign-in method: enable **Google**.
3. Build > Firestore Database: create a database (production mode), then paste
   the contents of `firestore.rules` into the Rules tab and publish.
4. Project settings > Your apps: add a **Web app** and copy the config values
   into `.env.local` (see `.env.example`).
5. Authentication > Settings > Authorized domains: add `outback-safe.vercel.app`.
6. Set the same `NEXT_PUBLIC_FIREBASE_*` variables in Vercel (Project > Settings >
   Environment Variables), then redeploy.

### Sign-in on iPhone

Safari blocks the third-party storage that Firebase's default sign-in helper
needs. To avoid this, the production auth domain is our own domain and
`next.config.ts` proxies `/__/auth/*` to `<project-id>.firebaseapp.com`.

- In Vercel set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=outback-safe.vercel.app`.
- In [Google Cloud console](https://console.cloud.google.com) > APIs & Services >
  Credentials > the "Web client (auto created by Google Service)": add
  `https://outback-safe.vercel.app/__/auth/handler` to **Authorized redirect URIs**
  and `https://outback-safe.vercel.app` to **Authorized JavaScript origins**.
- Locally, keep `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com`.

## Data model

Routes are stored at `users/{uid}/routes/{routeId}`:
`name`, `month`, `trip` (onboarding answers), `stops` (in order), `createdAt`,
`updatedAt`. Security rules allow a user to read and write only their own routes.

## PWA and offline

- `app/manifest.ts` generates the web manifest (standalone, dark theme colour).
- Icons live in `public/icons/` and are generated by `node scripts/generate-icons.mjs`.
- `public/sw.js` is a hand-written service worker. It caches the app pages and all
  scripts, styles and fonts they need, so the app opens offline. Pages are fetched
  network-first, so you always get the newest version when online.
- Offline, the map base tiles are not available (they load from CARTO), but pins,
  routes, hazards, onboarding and the emergency screen all work.
- Bump `VERSION` in `public/sw.js` to clear all old caches.
- The service worker only registers in production builds.
