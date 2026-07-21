# Build tracker — Maharishi Meditation MVP

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

- [ ] **Phase 11 — Connect to live backend** ⏸ deferred, by user choice (2026-07-21)
  - Swap the app's mock API client for real HTTP calls via `EXPO_PUBLIC_API_URL`
  - **Deliberately not blocking the rest of the build**: needs an Upstash Redis
    database (URL + REST token) and a Netlify site — account-owned resources.
    Offered three paths (self-provision a temporary dev DB, user supplies their
    own Netlify/Upstash, or skip for now) — user chose to skip for now since the
    app is fully functional on the mock backend already. Revisit whenever ready;
    it's a small, contained change since `app/src/api/worldPeace.ts` already
    hides the mock vs. real client behind one interface.
  - **When picking this back up:**
    1. Create an Upstash Redis database and a Netlify site (or reuse existing
       ones — this ecosystem already uses Netlify for other projects)
    2. Set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` as Netlify site
       env vars (never commit them)
    3. Deploy `backend/` to that site (`netlify.toml` is already configured)
    4. Add a real HTTP implementation of `WorldPeaceApiClient` in
       `app/src/api/worldPeace.ts` (or a new file) that calls the deployed
       `EXPO_PUBLIC_API_URL`, and switch `worldPeaceApi`'s export to it
  - **Gate (once resumed):** integration test against `netlify dev` (or the
    deployed URL) confirms increment + stats round-trip correctly

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
