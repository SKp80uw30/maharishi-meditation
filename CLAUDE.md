# Maharishi Meditation — Project Map

## What this is

A privacy-first, single-intention meditation app (Expo/React Native, iOS + Android,
Expo Go-testable). A person opens the app, begins a meditation "for World Peace" on
their own schedule, meditates for a chosen duration (or open-ended), and afterward
sees anonymous, collective participation counts. No accounts, no profiles, no stored
history, no personal data collection at all.

Core framing: this is **not** a scheduled/joined group session. Each person starts
their own session whenever they like; the app communicates that others are meditating
*at the same time*, overlapping — not that everyone is on one synced clock.

Source of truth for product scope: [`maharishi-meditation-prd.md`](maharishi-meditation-prd.md).
Source of truth for visual/UX spec: [`design_handoff_world_peace_mvp/README.md`](design_handoff_world_peace_mvp/README.md).
Live build tracker: [`TODO.md`](TODO.md) — **read this first on every session**, it says
what phase is done, in progress, or next.

## Repo structure

```
maharishi-meditation/
  CLAUDE.md                          ← this file
  TODO.md                            ← phase-by-phase build tracker, check here first
  maharishi-meditation-prd.md        ← product requirements (source of truth for scope)
  design_handoff_world_peace_mvp/    ← DESIGN REFERENCE ONLY, do not import directly
    README.md                        ← full screen-by-screen UX spec, exact values
    prd.md                           ← duplicate of the root PRD
    components/*.jsx                 ← HTML/React-like mockups; values are ground truth,
                                        syntax is illustrative only (not real RN code)
    tokens/*.css                     ← design tokens (colors, type, spacing, effects) —
                                        ported into app/src/theme/*.ts, see below
    reference_hifi_mockups.dc.html   ← open in a browser: all 6 screens, high-fidelity
    reference_wireframes.dc.html     ← historical low-fi structure only, ignore visually
  app/                               ← the Expo React Native app (the actual product)
  backend/                           ← Express + Redis API, deployed on Railway
  package.json                       ← root wrapper: Railway builds/starts backend/ through it
  railway.json                       ← Railway config
  Procfile                           ← start command (build + run backend/)
  eas.json                           ← EAS build profiles (development/preview/production)
```

## Commands

Run inside `app/`:

```bash
npm run typecheck          # npx tsc --noEmit
npm test                   # npx jest (jest-expo preset)
npx jest src/screens/__tests__/LaunchScreen.test.tsx   # single test file
npx jest -t "dispatches BEGIN"                         # single test by name
CI=1 npx expo start --web  # web build on :8081 (CI=1 skips the interactive prompt)
npx expo start --host lan  # for phone testing over Tailscale (see Device testing)
```

Run inside `backend/`:

```bash
npm run typecheck          # npx tsc --noEmit
npm test                   # npx jest (ts-jest, node env — no live Redis needed)
npm run dev                # ts-node src/server.ts (local Express server)
npm run build && npm start # emits dist/ and runs it — what Railway does
```

Phase gate = typecheck + jest green in both packages, plus the visual check
described under Testing below.

## Architecture decisions (confirmed, don't relitigate)

- **Mobile**: Expo SDK 57, TypeScript, blank template. Must stay Expo Go-compatible —
  no custom native modules that require a dev client. **Expo's SDK changes fast; the
  scaffold's `app/AGENTS.md` flags this — check `context7` for current API shape
  before assuming any Expo package's API from training data**, e.g. audio is
  `expo-audio` (`useAudioPlayer` hook), not the deprecated `expo-av`.
- **Screens/navigation**: NOT React Navigation. A single root component
  (`app/App.tsx`) holds a reducer (`app/src/state/`) with a `screen` field and
  renders the matching screen component, passing callback props (`onBegin`,
  `onContinue`, `onBack`, …) — mirrors the design reference's own architecture and
  the PRD's "very simple screen stack" requirement. Zero nav dependency.
- **Design system**: tokens live in code at `app/src/theme/` (`colors.ts`,
  `typography.ts`, `spacing.ts`, `effects.ts`), ported verbatim from
  `design_handoff_world_peace_mvp/tokens/*.css`. Primitives (`Button`, `Card`,
  `ScreenContainer`, `BackButton`, `BlobMark`, `GradientWash`, `ProgressRing`,
  `Sheet`, `StoryTimeline`)
  live in `app/src/components/` and are the only things screens should use for
  spacing/color/shadow — never hardcode a hex or px value in a screen file.
- **SVG needs**: `react-native-svg` for the blob hero mark and the session ring's
  conic progress arc (RN has no conic-gradient or elliptical border-radius);
  `expo-linear-gradient` for the linear "sunrise" gradient; svg `RadialGradient` for
  the radial "glow" washes.
- **Testing**: `npx tsc --noEmit` + `npx jest` (jest-expo preset,
  `@testing-library/react-native`) run inside `app/` (and `backend/` from Phase 10).
  Visual checks use `npx expo start --web` (`CI=1` to avoid the interactive prompt)
  + Playwright screenshots compared against `reference_hifi_mockups.dc.html`. This is
  the gate for checking off a phase in `TODO.md` — don't check a box without running it.
  Run jest from *inside* `app/` or `backend/` — from the repo root, npx resolves a
  different jest that scans all of `FreeDAIY-All` and hangs.
  `app/jest.setup.js` applies `react-native-safe-area-context`'s official mock
  globally; without it, `<SafeAreaProvider>` renders nothing under Jest (silently
  hiding the entire tree) and `useSafeAreaInsets()` throws.
- **Metro's watcher is unreliable here**: the dev server can keep serving a module
  graph frozen at start-up, so screenshots show pre-edit styling while the code on
  disk is correct. Restart it (`--clear`) before any visual QA run rather than
  debugging a phantom.
- **Backend**: Express server (`backend/src/server.ts`) deployed on **Railway**
  (live at `https://maharishi-meditation-production.up.railway.app`). Originally
  Netlify Functions (Phase 10), refactored to Express for Railway; the dead
  Netlify layer is gone. Handler/store logic is factory-based (`handlers.ts`,
  `worldPeaceStore.ts`) so tests inject a fake store — no live Redis or env vars
  needed to run the backend tests. Store init is lazy, so a Redis
  misconfiguration degrades `/health` to 503 instead of crashing the boot.
  Data model: on POST, `INCR wp:total:all` and `INCR wp:total:{YYYY-MM-DD}`
  plus `SADD` of a session id (30-min expiry) for the active-meditator estimate;
  on GET, `MGET` both counters plus `SCARD`. No schema, no user data — see PRD
  "Backend architecture".
- **Redis client**: `redisClient.ts` supports two backends behind one interface —
  `REDIS_URL` (the `redis` package, RESP wire protocol; **this is what's live**)
  and `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (`@upstash/redis`,
  REST). `@upstash/redis` cannot speak `redis://`, so don't point it at
  `REDIS_URL`.
- **Presence vs. completions — keep these separate.** `worldPeaceStore` counts
  sessions that have *finished* (the increment fires on arrival at Stats).
  `presenceStore` counts sessions *in flight*. They were once entangled, which
  made `current_active_estimate` structurally dishonest: it was derived from the
  completion counter, so everyone it counted had already stopped meditating.
  Presence is a sorted set scored by each entry's own expiry, swept on read, so
  sessions age out individually — not one shared TTL over a whole set.
- **Presence endpoints**: `POST /presence/start`, `/presence/heartbeat` (the same
  operation — both just extend the entry) and `/presence/end`.
  `GET /stats/world-peace?exclude=<session_id>` omits the caller so the number
  can honestly be described as *others*.
- **Hold length comes from the chosen duration** (`app/src/hooks/usePresence.ts`):
  a timed session declares its whole length plus grace up front and so needs **no
  heartbeat at all**; only open-ended sessions ping, because only they have an
  unknowable end. Don't "simplify" this into a long fixed window — a hold that
  outlives the actual sit is what made the old number describe people who had
  already left.
- **`current_active_estimate` is optional and often `0`.** Treat `0` exactly like
  absent in the UI — never render "0 meditators" beside copy saying others are
  meditating. Session copy lives in `story.ts` (`sessionPresence`) and only
  claims company when there genuinely is some.
- **Session ids** are client-generated, opaque, ephemeral, and tied to nothing —
  not a user or device identifier, never persisted. The backend length/charset
  check is a storage guard, not identity.
- **CORS**: the server sends `Access-Control-Allow-Origin: *`. Required because
  the react-native-web build calls the API cross-origin from a browser; safe
  because the API is anonymous (no cookies, credentials, or user data).
- **API client switch (Phase 11, live)**: `app/src/api/worldPeace.ts` exports one
  `worldPeaceApi` — the real HTTP client when `EXPO_PUBLIC_API_URL` is set
  (`app/.env` points it at the Railway URL; not committed), otherwise the seeded
  mock (`createMockWorldPeaceApi`) for offline dev. Screens take the client as an
  injectable prop defaulting to that singleton, so tests never touch the network.
- **Narrative copy (Phase 14)**: all story/whimsy prose lives in
  `app/src/content/story.ts` — one source of truth, no inline narrative strings in
  screen files (same rule as design tokens); copy that varies by state is a
  function there (e.g. `statsThankYou(minutes)`), not a template literal in the
  screen. Story-related UI: `Sheet`, `StoryTimeline`, `components/StoryOnboarding/`
  (a 5-beat opt-in flow off Intention's "Go deeper" link).
- **Motion & accessibility**: every animation goes through
  `app/src/hooks/useReducedMotion.ts`, which returns `boolean | null` — `null`
  means the async system check hasn't resolved, and animations must hold off
  until it's exactly `false`. Never call `AccessibilityInfo.isReduceMotionEnabled()`
  directly in a component, and never create an `Animated.Value` inline in a render
  body (use `useRef`) — as a changing effect dependency it will re-fire the effect
  every render.
- **Counts the API may not provide**: `current_active_estimate` is optional in the
  contract. When it's absent, hide the count and soften the copy — never render a
  literal "0 meditators" next to text claiming others are meditating.
- **Ambient audio**: session-screen sound toggle is functional, not decorative. No
  real brand audio was provided in the design handoff, so a placeholder ambient loop
  is synthesized locally (ffmpeg) rather than sourced from a third party — avoids
  licensing ambiguity, flagged in code as swappable for real brand audio later, same
  treatment the design system already gives the Nunito font and Phosphor icons.
- **Git**: repo root is the git root (not `app/` or `backend/` individually). Commit
  at the end of each completed phase.

## State model (mirrors design README "State management")

Split across two layers — deliberately, not everything lives in the global reducer:

- **Global** (`app/src/state/appReducer.ts`, drives navigation):
  `screen`: `'launch' | 'intention' | 'duration' | 'session' | 'stats' | 'about'`;
  `duration`: `number | 'open' | null` — chosen on Duration, consumed by Session
  and Stats, reset to `null` on `RESTART` (Stats → Duration) and `HOME`
  (Stats → Launch); `soundOn`: boolean, defaults `true`,
  session-scoped only (no account to persist to).
- **Local to the Session screen** (`app/src/hooks/useSessionTimer.ts`):
  `secondsElapsed` / `secondsLeft` — transient, on-device only, ticks once a
  second for exactly as long as the Session screen is mounted. This is
  intentionally *not* in the global reducer: no other screen reads it, and
  routing a 1Hz tick through app-wide state would re-render the whole tree every
  second for nothing. (This was originally in the reducer from Phase 2; moved
  out in Phase 6 once the timer hook made the better home obvious.)
- Stats payload (`total_today`, `total_all_time`, optional `current_active_estimate`):
  fetched/updated only on the Stats screen, via the API client
  (`app/src/api/worldPeace.ts`).
- No persisted client store, no auth state, no user identifiers anywhere.

## API contract (PRD "Backend architecture" / "Recommended MVP decision set")

Presence routes (added after the MVP contract below, see "Presence vs.
completions" above): `POST /presence/start` · `POST /presence/heartbeat` ·
`POST /presence/end`, each taking `{ session_id, hold_seconds? }` and returning
`{ current_active_estimate }` counting everyone *except* the caller.


- `POST /meditations/world-peace` — increments the World Peace counter. No body
  needed (topic is implied by the URL). Fires **once, on arrival at the Stats
  screen** (documented choice — PRD flags start-vs-completion as an open question;
  both "end early" and natural completion route to Stats, so incrementing there
  covers both with exactly one trigger).
- `GET /stats/world-peace` — returns `{ total_today, total_all_time,
  current_active_estimate? }`.
- No user ID, email, device identity, profile data, or location data in any request.

## Deployment

**`main` is the single canonical branch, and Railway auto-deploys it.** Work on
`main`; pushing it deploys the backend.

It wasn't always one branch. Until 2026-08-18 there were two histories with no
common ancestor — a local phase-by-phase lineage holding all the `app/` work, and
a separate GitHub lineage holding the Railway machinery and backend fixes. They
were merged (`--allow-unrelated-histories`), keeping `app/` from the local side
(a strict superset) and `backend/` plus the deploy machinery from the deployed
side. Both histories are preserved in the merge, so older commits on either side
still resolve. If you find a `master` branch lying around, it is that pre-merge
lineage and is superseded.

Build path (don't rearrange casually — this exact shape is what deploys):
`railway.json` + root `package.json` wrapper (`build` → `cd backend && npm
install && npm run build`, `start` → `cd backend && npm start`), with
`backend/tsconfig.json` emitting to `backend/dist/`.

**Railway CLI**: `railway link --project 5d79b1d5-b9b6-465c-86ce-4c6fe5b4cbb8
--environment production`, then `railway status --json` for deploy state and
`railway variables --service maharishi-meditation` for env. (No Railway MCP is
configured — CLI only.) The app service's Redis comes from `REDIS_URL`, injected
by the project's own Redis service; there are no Upstash credentials set, so the
`redis`-package branch of `redisClient.ts` is the live one.

**Watch for interface drift in `backend/`**: `redisClient.ts` once kept a private
copy of the store's command interface, and when the store started needing
`sadd`/`scard` the copy didn't follow — every Railway build failed for weeks
while an older image kept serving. `worldPeaceStore.ts` exports `RedisClient` as
the single source of truth; keep it that way.

## Device testing

**Expo Go does not currently work on Steve's iPhone 13** — Expo Go builds are
pinned 1:1 to a single SDK per release, and the App Store only offers this
phone a build capped by its installed iOS version, which lands at SDK 54. This
project is on SDK 57. Not something to "fix" in code — either the phone's iOS
needs updating (the user's call) or testing needs to go through an EAS
development build instead of Expo Go (`eas.json` at repo root already defines
development/preview/production profiles; see Phase 13 in `TODO.md`).

**Working fallback (confirmed live, 2026-07-22):** `npx expo start --host lan`
already serves the web build at its root path (`react-native-web` is
installed) — point the phone's Safari at `http://<this Mac's Tailscale
IP>:8081` over Tailscale (`tailscale ip -4` if the IP has changed since) and
it's fully interactive on the actual device screen. Not true native rendering,
but the same code — Phase 12's QA pass already confirmed visual fidelity
between the web build and native. Skip straight to this; don't re-attempt Expo
Go on this device without a newer iOS/Expo Go first.

If scanning/opening an `exp://` URL is ever relevant again (e.g. once on a
device where Expo Go does support the SDK): the *system* Camera app can't hand
custom URL schemes to Expo Go — it treats them as a text search. Scan from
inside Expo Go's own scanner, or paste the link into Notes/Messages/Mail and
tap it there (iOS registers custom schemes as tappable links in those apps,
not in Safari's address bar).

## Working conventions

- Read `TODO.md` at the start of every session to see current phase status.
- Each phase: implement → run its test gate → check the box in `TODO.md` → commit →
  move to the next phase.
- Don't hardcode design values in screens — pull from `app/src/theme/`.
- Don't add dependencies not already justified above without a real need.
