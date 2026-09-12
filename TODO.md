# Build tracker — One Field MVP

Read [`CLAUDE.md`](CLAUDE.md) first for architecture context. Work top to bottom.
Each phase: implement → run its test gate → check the box below → `git commit` →
move on. Don't check a box without actually running its gate.

- [x] **Phase 0 — Repo & tooling scaffold**
  - git repo initialized at root; `.gitignore` covers node_modules/.expo/.env/.DS_Store
  - `app/` scaffolded: Expo SDK 57, TypeScript, blank template
  - Installed: `jest-expo`, `jest`, `@types/jest`, `@testing-library/react-native`,
    `react-native-svg`, `expo-linear-gradient`, `expo-audio`, `react-dom`,
    `react-native-web`
  - `package.json` scripts: `test`, `typecheck`; jest preset `jest-expo`;
    `tsconfig.json` has `"types": ["jest"]` (needed — TS doesn't auto-pick up
    `@types/jest` globals otherwise under this base config)
  - `backend/` skeleton created (`package.json`, `netlify/functions/` dir, empty
    pending Phase 10)
  - **Gate (all passed):** `npx tsc --noEmit` clean · `npx jest` (1/1 smoke test
    passed) · `CI=1 npx expo start --web` boots and serves 200 on :8081

- [x] **Phase 1 — Design tokens & primitive components**
  - Ported `tokens/*.css` verbatim into `app/src/theme/{colors,typography,spacing,
    effects}.ts` (+ `blobPath.ts`, an exact SVG elliptical-arc reproduction of the
    CSS `--radius-blob` shorthand — the four corner radii sum to exactly 100% per
    edge, so no CSS overlap-scaling was needed to be exact)
  - Discovered while porting: RN's `boxShadow` style prop (CSS box-shadow syntax,
    New Architecture) supports the tokens' multi-layer shadows verbatim — used
    instead of the legacy shadowColor/shadowOffset/shadowOpacity/elevation quintet
  - Built primitives in `app/src/components/`: `Button` (primary pill / outline,
    the latter only used for Session's End early/End session), `Card`,
    `ScreenContainer` (background + optional radial wash + safe-area, via
    `react-native-safe-area-context` — the RN-core `SafeAreaView` is deprecated),
    `BlobMark` (svg + linear gradient), `GradientWash` (svg radial, `glow` |
    `duskGlow` variants), `ProgressRing` (svg stroke-dasharray ring — RN/SVG has no
    conic-gradient, so this reproduces the design's conic-arc-behind-inner-circle
    trick with the standard stroke-ring technique instead, same visual result)
  - Installed for this phase: `react-native-svg`, `expo-linear-gradient`,
    `react-native-safe-area-context`, `expo-font` + `@expo-google-fonts/nunito`
  - Deleted the placeholder `src/__tests__/smoke.test.ts`
  - **Gate — passed:** `npx tsc --noEmit` clean · `npx jest` (11/11 passed across
    6 suites, one per primitive)

- [x] **Phase 2 — App shell / state machine**
  - `app/src/state/appReducer.ts`: pure reducer over
    `{screen, duration, secondsLeft, secondsElapsed, soundOn}` with actions for the
    full linear flow (BEGIN, CONTINUE, BACK, SELECT_DURATION, START_SESSION, TICK,
    FINISH_SESSION, END_SESSION_EARLY, TOGGLE_SOUND, RESTART, OPEN_ABOUT) — BACK is
    screen-contextual (Intention→Launch, Duration→Intention, About→Launch, no-op
    elsewhere, matching the README's back-arrow rules)
  - `App.tsx` wires the reducer, loads Nunito via `@expo-google-fonts/nunito` +
    `useFonts`, wraps in `SafeAreaProvider`, switch-renders the current screen
  - Added minimal placeholder screens (`app/src/screens/*.tsx`) wired to real
    dispatch actions — bare text/tap targets, not yet styled; each gets built to
    the design spec in its own phase (3–9) below
  - **Gate — passed:** `npx tsc --noEmit` clean · `npx jest` (23/23 passed,
    reducer covers every transition including back-nav no-ops and the
    Stats→RESTART→Duration loop) · runtime check: `CI=1 expo start --web` served
    200, and fetching the actual Metro bundle confirmed it compiles clean (no
    unresolved-module/syntax errors, `App` present). **Note:** Playwright MCP
    returned "Connection closed" this session, so the true visual screenshot gate
    (spec'd for Phase 3+) hasn't run yet — retry it when building the first real
    screen; fall back to a different visual-check method if it stays down.

- [x] **Phase 3 — Launch screen**
  - Hero blob, title "Maharishi Meditation", subtitle, "Begin" pill button, plus a
    small ⓘ info affordance top-right to About (README requires About be reachable
    from Launch; `LaunchScreen.jsx` itself doesn't show this control — added per
    README, not the literal JSX; kept unobtrusive so it doesn't compete with Begin)
  - **Tooling note:** Playwright MCP returned "Connection closed" on repeated
    attempts this session (likely can't launch a browser process in this sandbox)
    — adapted the visual-QA gate to: `tsc`/`jest` render+interaction tests, plus
    fetching the actual Metro web bundle and grepping for real compile errors
    (distinct from a couple of unrelated libraries' own internal error-class
    definitions, which show up as false positives). A real pixel/screenshot pass
    is deferred to Phase 12 (retry Playwright, or fall back to the xcode MCP
    tools' iOS Simulator screenshot capability).
  - **Gate — passed:** `tsc --noEmit` clean · `jest` (copy/labels present, Begin
    dispatches `BEGIN`, ⓘ dispatches `OPEN_ABOUT`) · bundle fetch confirms clean
    compile

- [x] **Phase 4 — Intention screen**
  - Micro-label, headline, intention card ("World Peace & Non-violence" + supporting
    line), "Begin your session" CTA, back arrow → Launch
  - Factored the shared "←" back-arrow pattern (used by Intention, Duration, and
    About) into a `BackButton` primitive in `app/src/components/`
  - **Gate — passed:** `tsc --noEmit` clean · `jest` (28/28: intention copy
    present, CONTINUE/BACK dispatch correctly) · bundle fetch confirms clean
    compile

- [x] **Phase 5 — Duration screen**
  - Explicit 2×2 rows (3/5/10/20 min, not a flex-wrap grid — exact/predictable for
    exactly four fixed tiles) + full-width "Open" tile below, selected/unselected
    styling per spec
  - **Note on "Begin meditation" gating:** left it always tappable (reducer's
    `START_SESSION` already no-ops if `duration` is still null, per Phase 2's
    guard) rather than visually disabling the button — matches the JSX reference,
    which doesn't show a disabled state either
  - **Toolchain finding (applies retroactively to all prior interaction tests):**
    `@testing-library/react-native` v14 made `fireEvent.press` async too (wraps in
    `act()`), same as `render`. Un-awaited calls were producing "overlapping
    act() calls" console errors that didn't fail tests but were silently
    unreliable — fixed every call site across all existing test files in this
    phase, all 32 tests still green with the warnings gone
  - **Gate — passed:** `tsc --noEmit` clean · `jest` (32/32, no console warnings:
    all 5 options selectable, correct tile shows `accessibilityState.selected`,
    START_SESSION/BACK dispatch correctly) · bundle fetch confirms clean compile

- [x] **Phase 6 — Session screen + timer hook**
  - `app/src/hooks/useSessionTimer.ts`: countdown (timed) / count-up (Open),
    `onFinish` fires exactly once. **Design change from Phase 2:** discovered
    while building this that `secondsLeft`/`secondsElapsed`/`TICK` didn't belong
    in the global `appReducer` at all — per CLAUDE.md's own state model note,
    session timing is local to the Session screen, and ticking it through the
    global reducer would re-render the whole app tree every second for nothing.
    Moved it into this hook's own local `useState`; removed those three from
    `appReducer`/`AppState` and updated its tests to match (still 41/41 passing
    overall — this simplified the reducer, nothing regressed)
  - `renderHook`/`act` (both exported by `@testing-library/react-native`,
    despite not showing up in a first pass at the public `.d.ts` — re-checked
    and found them under `pure.d.ts`) used with `jest.useFakeTimers` for the
    hook tests, advancing one second at a time per `act()` call to mirror how
    real separately-scheduled ticks actually commit
  - Dark screen, svg `ProgressRing` wired to `progress` (null in Open mode = flat
    track, no arc), MM:SS via `formatClock`, sound toggle pill wired to
    `soundOn`/`TOGGLE_SOUND` (real audio playback is Phase 7 — copy already
    reflects the toggle), auto-dispatches `FINISH_SESSION` at 0:00 (timed only),
    "End early"/"End session" reuses the `Button` `outline` variant
  - **Gate — passed:** `tsc --noEmit` clean · `jest` (41/41: hook reaches 0 and
    fires finish exactly once and never again on further ticks, Open mode counts
    up indefinitely and never finishes, screen wiring/copy/sound-toggle all
    correct) · bundle fetch confirms clean compile

- [x] **Phase 7 — Ambient audio**
  - Synthesized a seamless 30s placeholder loop with ffmpeg
    (`app/assets/audio/ambient-loop.mp3`, regeneration command + rationale in its
    own README) — a soft drone (110/165/220Hz + slow tremolo), all frequencies
    exact integer multiples of `1/30s` so the waveform is perfectly periodic over
    the file length: loops with no click at the seam, no third-party licensing
    question since nothing was sourced
  - `app/src/hooks/useAmbientLoop.ts` wraps `expo-audio`'s `useAudioPlayer`,
    `player.loop = true`, play/pause tied to `soundOn`; stops automatically on
    leaving Session since expo-audio releases the player on unmount
  - **Toolchain finding:** expo-audio registers a native module at import time
    that doesn't exist under Jest — any test that renders `SessionScreen` (now or
    later, e.g. Phase 12's full-flow test) needs it mocked. Added a shared manual
    mock (`app/__mocks__/expo-audio.ts` + jest `moduleNameMapper`) instead of
    duplicating a local `jest.mock()` per test file
  - **Also fixed:** `expo-audio`, `expo-linear-gradient`, `react-native-svg` had
    landed in `devDependencies` from earlier `--dev` installs — moved to
    `dependencies` since they're genuine runtime deps of the shipped app
  - **Gate — passed:** `tsc --noEmit` clean (confirmed `player.loop` against the
    real shipped types) · `jest` (45/45: hook enables looping + plays when
    active, pauses when inactive/toggled off; SessionScreen actually calls
    play()/pause() correctly based on `soundOn`) · bundle fetch confirms clean
    compile against the *real* (unmocked) `expo-audio` + audio asset. Actual
    audible playback is a manual spot-check, not part of the automated gate.

- [x] **Phase 8 — Stats screen + API client**
  - `app/src/api/worldPeace.ts`: `WorldPeaceApiClient` interface
    (`increment()`, `getStats()`) + `createMockWorldPeaceApi(seed)` factory (each
    instance owns its own state — no shared module singleton to leak between
    tests); `worldPeaceApi` is the mock instance the app actually uses until
    Phase 11. Seeded with the design mockup's example numbers (12,483 /
    1,204,996) so the app feels like part of something larger even offline.
  - Stats screen calls `increment()` once on mount, then `getStats()`
    (`apiClient` is an injectable prop, defaulting to the real singleton, for
    test isolation without module mocking); renders the two stat cards +
    "Meditate again" → `RESTART`. A failed fetch degrades to a "—" placeholder
    rather than blocking the ritual — stats are inspirational, not load-bearing,
    consistent with the PRD's minimal-backend philosophy.
  - Fixed a wiring gap from Phase 2's placeholder: `App.tsx` was only passing
    `dispatch` to `StatsScreen`, not `state` — needed now for the duration-aware
    thank-you copy
  - **Gate — passed:** `tsc --noEmit` clean · `jest` (53/53: increment fires
    exactly once and totals render correctly, timed vs. Open thank-you copy,
    RESTART dispatches, and a rejecting client degrades to placeholders without
    crashing or blocking "Meditate again") · bundle fetch confirms clean compile

- [x] **Phase 9 — About screen**
  - Privacy card + practice card + version footer, reachable from Launch's info
    affordance (added in Phase 3). All 6 screens from the design handoff are now
    built and wired into the app shell.
  - **Gate — passed:** `tsc --noEmit` clean · `jest` (55/55: privacy/practice
    copy and version footer present, BACK dispatches correctly) · bundle fetch
    confirms clean compile

- [x] **Phase 10 — Backend: Netlify Function + Upstash Redis**
  - `backend/src/worldPeaceStore.ts`: `createRedisWorldPeaceStore(redis)` —
    `increment()` does `INCR wp:total:{UTC YYYY-MM-DD}` + `INCR wp:total:all` in
    parallel; `getStats()` does one `MGET` for both, missing keys (a brand-new
    day) default to 0 rather than erroring
  - `backend/src/handlers.ts`: `createIncrementHandler(store)` /
    `createStatsHandler(store)` — factories, not the handlers themselves, so
    tests inject a fake store without touching Redis/env; method-checked (405 on
    wrong verb), and a thrown store error becomes a 500 response, never a crash
  - `backend/netlify/functions/{meditations,stats}-world-peace.ts`: the two real
    entry points, each just wiring `getWorldPeaceStore()` (the real
    `Redis.fromEnv()`-backed singleton, `backend/src/redisClient.ts`) into its
    handler factory
  - `netlify.toml` at repo root: backend-only site (no frontend build here — the
    Expo app deploys separately), redirects mapping the PRD's exact paths
    (`/meditations/world-peace`, `/stats/world-peace`) onto Netlify's default
    `/.netlify/functions/<name>` URLs
  - **Toolchain findings:** pinned backend's `typescript` to `~6.0.3` (matching
    the frontend) after a bare `npm install` grabbed 7.0.2, which is newer than
    `ts-jest`'s supported range; `@upstash/redis`'s actual shipped `mget<T>`
    generic types the *whole result array* (`T extends unknown[]`), not each
    element — the doc example is misleading on this point, went with what the
    real `.d.ts` demands; switched `moduleResolution` from the deprecated
    `"node"` alias to `"nodenext"`, and added `isolatedModules: true` to silence
    a ts-jest hybrid-module-kind warning
  - **Gate — passed:** `tsc --noEmit` clean · `jest` (10/10: day-bucket key
    format, increment bumps both counters and returns new totals, stats reads
    both keys and defaults a fresh day to 0, both handlers reject the wrong HTTP
    method with 405 and turn a store exception into a 500 rather than crashing)
    — all against a fake store/Redis double, no live network or credentials
    needed for this phase

- [x] **Phase 11 — Connect to live backend** (done 2026-07-2x, commits `2a9aa9e`
      + `4f75dac`; this entry was left stale and is corrected here)
  - Was deferred on 2026-07-21 for lack of account-owned resources, then picked
    back up: **the deploy target changed from Netlify Functions to Railway**
    (`2a9aa9e` refactored `backend/` to a plain Express server, root `Procfile`
    runs it). Live at `https://maharishi-meditation-production.up.railway.app`
    — `/health`, `/stats/world-peace`, `/meditations/world-peace` all verified
    responding 200 with real Upstash-backed counters.
  - `app/src/api/worldPeace.ts` now picks the real HTTP client when
    `EXPO_PUBLIC_API_URL` is set (it's in `app/.env`, gitignored) and falls back
    to the seeded mock for offline dev.
  - **Cleanup done in Phase 14** (below): the abandoned Netlify layer
    (`backend/netlify/`, root `netlify.toml`) was deleted, and the `build`
    script was made real — it had been `tsc` against a config with
    `noEmit: true`, so `npm run build` emitted nothing and the `npm start`
    the Procfile invokes could never have found `dist/server.js`.

- [x] **Phase 12 — Full-flow QA pass**
  - **Playwright MCP tool itself never worked this session** ("Connection
    closed" on every `browser_navigate` call, likely can't spawn a browser
    process in this sandbox) — worked around it by installing/running
    Playwright directly via a plain Node script through Bash instead of the MCP
    tool, which worked fine. Real screenshots, not a placeholder workaround.
  - Scripted a full click-through on `expo start --web`: Launch → Begin →
    Intention → Begin your session → Duration → select 3 min → Begin meditation
    → Session → End early → Stats → Meditate again → back to Duration (freshly
    reset) → Back → Back → Launch → ⓘ → About. Zero console/page errors the
    whole way. Screenshots of all 6 screens sent to the user.
  - **Bug found and fixed during this pass:** `BlobMark` looked like it had a
    solid white square behind it at full-page zoom. Traced it properly rather
    than guessing — `getComputedStyle` confirmed the View/Svg were genuinely
    transparent, and a tight high-DPI crop of just the element showed it's the
    *correct*, *expected* behavior of an organic blob shape inscribed in a
    square viewBox: the shape's own corners don't reach the box's true corner
    points (same as the reference design's CSS `border-radius` technique — any
    rounded/blob shape leaves its bounding box's corners showing whatever's
    behind it). What looked like a bug was page-background contrast making
    those corner gaps read as a faint outline at small preview size. Reverted
    the (unneeded) fix attempts; kept the explicit `backgroundColor:
    'transparent'` hygiene since it's correct regardless.
  - Confirmed live in the running app (not just unit tests): the mock API
    client's counts actually increment session-to-session (12,483→12,484,
    1,204,996→1,204,997), and "Meditate again" really does reset the duration
    selection before landing back on Duration.
  - All prior test suites green in both `app/` (55/55) and `backend/` (10/10) —
    65 tests total.
  - Did not do a separate iOS Simulator spot-check — the web QA pass was thorough
    enough (real screenshots, real click-through, zero errors) that it wasn't
    needed; worth doing before a real device/store submission, not blocking here.

- [x] **Phase 12b — Physical device verification (2026-07-22)**
  - Tried Expo Go on Steve's iPhone 13: **blocked**. This app is on Expo SDK 57;
    Expo Go builds are pinned 1:1 to one SDK per release, and the App Store only
    offers this phone an Expo Go build capped by its installed iOS version — that
    ceiling lands at SDK 54, not 57. Not fixable from this session (would need an
    iOS update on the device, the user's call, not something to do unprompted).
  - Tried three connectivity paths before hitting the SDK wall: USB via
    `devicectl` (phone got unplugged mid-session), an ngrok tunnel
    (`npx expo start --tunnel`, needed `@expo/ngrok` installed first), and
    Tailscale (this Mac's tailnet IP `100.123.223.78`, confirmed reachable via
    `tailscale ping`). Generated a QR code (`qrencode`, installed via brew) for
    the `exp://` URL — the *system* Camera app can't hand off custom URL schemes
    to Expo Go (it tries a web search instead); scanning has to happen from
    inside Expo Go's own scanner, or the link needs to be tapped from Notes/
    Messages/Mail, which iOS does register as an openable custom-scheme link.
  - **Working fallback, used successfully:** the already-running LAN-mode dev
    server (`npx expo start --host lan`) serves the web build at its root path
    with no extra flag needed (`react-native-web` was already installed from
    Phase 0's tooling gate). Pointed the phone's Safari at
    `http://<tailscale-ip>:8081` over Tailscale — confirmed working by the user,
    full flow interactive on the actual device screen. Not true native
    rendering, but the same code, and Phase 12's QA pass already established
    visual fidelity between the web build and the native design spec.
  - **For next time testing on this specific phone:** skip Expo Go entirely,
    go straight to `npx expo start --host lan` + Tailscale + mobile Safari. The
    Mac's Tailscale IP can change if Tailscale is reset — check with `tailscale
    ip -4` if `100.123.223.78` stops working. Real native-build testing on this
    device needs Phase 13's EAS development build instead of Expo Go.

- [x] **Phase 14 — Narrative & whimsy layer** (completed 2026-08-17)
  - Landed as spec'd below, plus a `StoryOnboarding` flow (5 beats: origin →
    the -16% finding → research timeline → "many minds, one field" ripples →
    "now it's you") reachable from Intention's "Go deeper" link. Kept it opt-in
    off the main ritual rather than gating first launch, consistent with the
    phasing note below.
  - **Superseded 2026-08-19**: the story now also opens itself on a first visit
    to Intention, and only then — Steve asked for both routes in. This is what
    put the app's single persisted key on disk; see CLAUDE.md's state model.
  - **Fixed while completing it** (the work was left mid-flight and failing):
    - 11 failing tests across 3 suites. Root cause of 8 of them was
      `react-native-safe-area-context`: its real provider yields no insets under
      Jest, so `<SafeAreaProvider>` rendered *nothing* (hiding the whole tree)
      and `useSafeAreaInsets()` threw without one. Fixed globally with the
      library's own shipped mock via `app/jest.setup.js` — worth knowing for any
      future component that takes insets.
    - Stats thank-you copy moved into `story.ts` as `statsThankYou(minutes)`;
      it was still inline prose in the screen, contradicting this phase's own
      "no inline narrative in screens" rule.
    - `Sheet`'s `testID` sat on the `Modal` (not pressable), so the
      backdrop-dismiss test could never pass; moved to the backdrop `Pressable`.
    - Reduce-motion was re-implemented ad hoc per component. Replaced with one
      `useReducedMotion()` hook returning `boolean | null`, where `null` means
      "system check hasn't resolved yet" and animations hold off — otherwise
      motion flashes for exactly the users who asked for none. All four
      animation sites now use it. Deleted `useCountUpAnimation.ts` (never
      imported anywhere).
    - **Real bug in `StoryBeat5`:** `new Animated.Value(0)` was created inline
      each render and used as a `useEffect` dependency, so the effect re-ran
      every render and re-fetched the API in a loop. Now a `useRef`.
    - Honesty fixes: Intention and Beat 5 rendered a literal "0 meditators"
      when the API returns no `current_active_estimate` (it's optional in the
      contract), directly contradicting the copy beside it. Both now hide the
      count and soften the sentence.
    - Layout: story beats collided with the bottom nav. Progress dots moved
      into the nav bar (which got a solid backdrop so scrolling timeline text
      passes behind it), and Beat 4 got bottom clearance.
  - **CORS:** the web build calling the Railway API was blocked by CORS in
    every browser run. Added permissive CORS to the Express server — safe here
    because the API is anonymous by design (no cookies, credentials, or user
    data). **Not live until `backend/` is redeployed to Railway.**
  - **Gate — passed:** `tsc --noEmit` clean in both packages · `jest` 70/70 in
    `app/` (was 53/64) and 10/10 in `backend/` · full Playwright click-through
    of all 6 screens + all 5 story beats + both story surfaces with zero page
    errors (only the expected CORS errors, which the redeploy clears)
  - **Tooling gotcha worth remembering:** this Metro dev server does *not* pick
    up file edits reliably — it served a graph frozen at start-up, so
    screenshots kept showing pre-edit styling while a direct bundle fetch showed
    the new code. Restart with `--clear` before any visual QA run, or you will
    debug a bug that isn't there.

- [x] **Phase 14 (original spec, for reference)**
  - **Why this matters:** Phase 12's testing revealed the core issue — without the
    story of *why* group meditation matters, the app feels like a bare timer with
    a counter. Adding the Maharishi Effect narrative (50 years of research on
    collective meditation effects) + subtle whimsy (breathing animations, count-up
    numbers, contemplative micro-interactions) transforms it from functional to
    meaningful.
  - **Core changes:**
    - New `app/src/content/story.ts`: one source of truth for all narrative copy
      (one-liner premises for each screen, full origin story, experiment timeline,
      visual metaphors). No inline prose in screens.
    - New `app/src/components/Sheet.tsx`: minimal bottom-sheet modal (using RN's
      built-in `Modal`) for the full story + timeline, opened from Stats/About.
    - New `app/src/components/StoryTimeline.tsx`: vertical timeline component
      rendering experiment milestones.
    - Extend `BlobMark` + `ProgressRing` with optional `breathing?: boolean` prop
      (4-second pulse using existing `duration.breath` token + `easing.outSoft`,
      gated behind `AccessibilityInfo.isReduceMotionEnabled()` for accessibility).
    - Extend `StatsScreen` with count-up animation on the two stat numbers (0 →
      final value over ~800ms, same accessibility guard).
    - Update copy on **LaunchScreen** (subtitle), **IntentionScreen** (supporting
      line), **SessionScreen** (companion line to "Others are meditating..."),
      **StatsScreen** (fact card with experiment context), **AboutScreen** (third
      card with story excerpt + deep-dive link).
  - **Technical debt addressed:** No modal/overlay pattern existed in the app
    (`grep -rn "Modal"` returned nothing), and animations weren't used. This phase
    establishes both patterns consistently with existing design tokens/primitives.
  - **Phasing note:** Story lives *in* the core 5-step ritual (one line per screen)
    + optional deep-dive via Sheet, not gated behind the core flow. Each narrative
    line is crafted to feel grounded and necessary, not decorative.
  - **Gate — all pass to check off:**
    - `tsc --noEmit` clean
    - `jest` (existing 55/55 + new tests for Sheet/StoryTimeline/animation; expect ~75 total)
    - Bundle compiles (`CI=1 expo start --web` serves 200) and no console errors
    - Visual pass on the 5 modified screens (via Playwright or manual web pass)
      confirming breathing/count-up animations render, story copy fits the visual
      hierarchy, and no clash with design system colors/spacing
    - Reduced-motion testing: confirm animations are disabled when
      `AccessibilityInfo.isReduceMotionEnabled()` is true (can mock in Jest)

- [x] **Phase 15 — Reconcile the two git histories** (done 2026-08-18)
  - The two lineages (local `master` = Phases 0–14 app work; `origin/main` = the
    Railway-deployed backend + machinery) had **no common ancestor**. Neither was
    a superset, so nothing could simply be pushed over the other: `main`'s `app/`
    predated the entire Phase 14 narrative layer, and `master`'s backend couldn't
    talk to the project's Railway Redis at all.
  - Resolved by merging with `--allow-unrelated-histories` rather than picking a
    winner, so **both histories survive** and no commit was discarded. Resolution
    was by path, not by hunk: `app/` + docs from `master` (verified a strict
    superset — `main` had no app source `master` lacked), `backend/` + `railway.json`
    + the root `package.json` wrapper + `Procfile` from `main` (the proven deploy
    path). The dead Netlify layer was dropped on both sides, and `master`'s
    unused `tsconfig.build.json`/lockfile were removed so the build matches the
    shape that actually deploys.
  - **`main` is now the single canonical branch.** Verified before pushing:
    app 71/71, backend 11/11, backend builds `dist/`, and the live deploy
    still serves correctly afterward.

- [x] **Backend deployed with CORS + build fix (2026-08-18)**
  - The Railway build had been **failing on every deploy** since "Add live
    'current meditators' count" — `redisClient.ts` kept a private `RedisLike`
    interface (incr/mget) while the store moved to needing `sadd`/`scard`, so
    the adapters no longer type-checked. Production had been frozen on an older
    image the whole time, which is why the live API returned no
    `current_active_estimate`. Fixed by exporting the store's `RedisClient` as
    the single source of truth; also repaired the store's test double, which had
    the same drift (3 failing tests → 11/11 green).
  - Added the CORS middleware the web build needs (anonymous API, no cookies or
    credentials, so `*` is safe).
  - Deployed `d4d8cba` to Railway — **first successful build since the
    regression**. Verified live: `/health` 200 with CORS headers, OPTIONS
    preflight 204, `/stats/world-peace` now returning `current_active_estimate`,
    and a full web click-through with **zero console/page errors**.
  - Follow-on app fix (`1ae20dd`): with the feature finally live, the API
    returns a real `0` instead of omitting the field, so "0 meditators" appeared
    next to copy claiming others were meditating. Zero now hides the count like
    an absent field does.

- [x] **Phase 16 — Real-time presence (2026-08-18)**
  - **Why:** the "meditators now" number could only ever describe people who had
    already finished. It was derived from the completion counter, which fires
    when a session reaches Stats, so anyone mid-session was invisible. No window
    length fixes that — it measured the wrong event.
  - `backend/src/presenceStore.ts`: sorted set scored by each entry's own
    expiry, swept on read, so sessions age out individually. Replaces the shared
    single-TTL set that never expired members and so accumulated under steady
    traffic then dropped to zero all at once. Holds are clamped and scored from
    the **server** clock, so a client can't park a ghost in the count.
  - `app/src/hooks/usePresence.ts`: the hold is derived from the chosen
    duration, so **timed sessions need no heartbeat at all** — a 20-minute sit
    claims 20 minutes plus grace. Only open-ended sessions ping (every 2 min,
    with a 5-min hold, so one dropped ping doesn't evict a real meditator).
    Fewer requests than a fixed interval *and* the number stays true.
  - Session screen copy is now honest: the real count when there is one,
    "you are holding the space" when sitting alone. It previously asserted
    "Others are meditating alongside you right now" unconditionally.
  - **Bug found by deploying:** the first request after any deploy 500'd. The
    new stats route fetches counters and presence concurrently, and the RESP
    adapter's lazy connect was guarded by a boolean set from an async event, so
    both commands called `connect()` and the second threw. Now memoises the
    connect promise; a failed connect clears it so a transient outage retries.
  - **Gate — passed:** app 89/89 · backend 35/35 · deployed and verified live
    with two simultaneous browser sessions: alone → "You are holding the space",
    second joins → "One other person is meditating alongside you right now",
    and the count drops when one leaves.
  - ✅ **CONFIRMED WORKING BY STEVE (2026-08-18)** — accepted after hands-on
    testing across two browsers: starting a session in one made the other's
    live count rise, finishing made it fall, and both the live count and the
    completion totals moved correctly and independently. The feature is done,
    deployed, and verified in real use, not just by tests.
  - **How to test this properly:** you need *two concurrent clients* (two
    browsers, or phone + laptop). Solo, the live count is always 0 when you
    look at it — you can't be on the Intention screen and meditating at the
    same time. That's correct behaviour, not a bug, and it's the single most
    confusing thing about verifying presence by hand.
  - **Which number moves when** (traced against the live API):
    live presence rises on *start* and returns to 0 on *finish*;
    `total_today` / `total_all_time` rise on *finish*. They are independent by
    design — see CLAUDE.md "Presence vs. completions".
  - **Open:** the launch-event idea (a scheduled simultaneous meditation) cuts
    against the PRD's "not a scheduled/joined group session" framing. Worth a
    deliberate decision before building any countdown/join UI.

- [ ] **Phase 13 — (stretch, optional) Build readiness**
  - App icon/splash assets, `app.json` metadata, EAS build config for real-device
    testing beyond Expo Go
  - Out of MVP scope per PRD (only requires Expo Go testability) — do this last,
    only if everything above is done and there's time left
  - **Now has a concrete forcing reason, not just polish:** Phase 12b found that
    Expo Go itself can't run this app on Steve's iPhone 13 (SDK ceiling tied to
    its iOS version — see Phase 12b). An EAS development build sidesteps Expo Go
    entirely and would be the real fix for native (not web-fallback) testing on
    that device.
