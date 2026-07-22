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
  backend/                           ← Netlify Functions + Upstash Redis (Phase 10+)
```

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
  `ScreenContainer`, `BlobMark`, `GradientGlow`, `GradientSunrise`, `ProgressRing`)
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
- **Backend**: `backend/netlify/functions/` against `@upstash/redis`'s REST client
  (HTTP-based, fits serverless — no persistent connections). Data model: on POST,
  `INCR wp:total:all` and `INCR wp:total:{YYYY-MM-DD}`; on GET, `MGET` both keys.
  No schema, no user data — see PRD "Backend architecture".
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
  and Stats, reset to `null` on `RESTART`; `soundOn`: boolean, defaults `true`,
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

- `POST /meditations/world-peace` — increments the World Peace counter. No body
  needed (topic is implied by the URL). Fires **once, on arrival at the Stats
  screen** (documented choice — PRD flags start-vs-completion as an open question;
  both "end early" and natural completion route to Stats, so incrementing there
  covers both with exactly one trigger).
- `GET /stats/world-peace` — returns `{ total_today, total_all_time,
  current_active_estimate? }`.
- No user ID, email, device identity, profile data, or location data in any request.

## Device testing

**Expo Go does not currently work on Steve's iPhone 13** — Expo Go builds are
pinned 1:1 to a single SDK per release, and the App Store only offers this
phone a build capped by its installed iOS version, which lands at SDK 54. This
project is on SDK 57. Not something to "fix" in code — either the phone's iOS
needs updating (the user's call) or testing needs to go through an EAS
development build instead of Expo Go (see Phase 13 in `TODO.md`).

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
