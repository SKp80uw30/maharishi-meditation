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

- [ ] **Phase 7 — Ambient audio**
  - Synthesize a seamless placeholder ambient loop locally via ffmpeg (soft pad/tone,
    clearly commented as a placeholder pending real brand audio), save to
    `app/assets/audio/`
  - Wire to `expo-audio`'s `useAudioPlayer`, tied to `soundOn` + screen focus (stops
    on leaving Session, per README "sound toggle... session-scoped")
  - **Gate:** unit tests with the audio module mocked (play called when
    soundOn+mounted, stopped on unmount/toggle-off) — actual audible check is a
    manual spot-check, not part of the automated gate

- [ ] **Phase 8 — Stats screen + API client**
  - `app/src/api/worldPeace.ts`: typed interface (`increment()`, `getStats()`)
    behind a swappable implementation; MVP default = in-memory mock so the app is
    fully usable offline before the real backend exists
  - Stats screen calls `increment()` once on mount (see CLAUDE.md "API contract"),
    then `getStats()`, renders the two stat cards + "Meditate again" (loops to
    Duration per README)
  - **Gate:** mocked-client tests (increment called exactly once per arrival,
    correct render of returned totals) + screenshot

- [ ] **Phase 9 — About screen**
  - Privacy card + practice card + version footer, reachable from Launch's info
    affordance (added in Phase 3)
  - **Gate:** render test + screenshot

- [ ] **Phase 10 — Backend: Netlify Function + Upstash Redis**
  - `backend/netlify/functions/`: increment handler (`INCR wp:total:all`,
    `INCR wp:total:{YYYY-MM-DD}`) and stats handler (`MGET` both), against
    `@upstash/redis`'s REST client
  - `netlify.toml` at repo root pointing at `backend/netlify/functions`
  - **Gate:** handler unit tests with the Redis client mocked (no live network) ·
    typecheck clean

- [ ] **Phase 11 — Connect to live backend** ⚠️ needs user's accounts
  - Swap the app's mock API client for real HTTP calls via `EXPO_PUBLIC_API_URL`
  - **Blocked on**: an Upstash Redis database (URL + REST token) and a Netlify site
    to deploy the function to — these are account-owned resources; ask the user for
    them (or to provision via the Netlify MCP tools if authorized) when this phase
    starts, don't guess/fabricate credentials
  - **Gate:** integration test against `netlify dev` (or the deployed URL) confirms
    increment + stats round-trip correctly

- [ ] **Phase 12 — Full-flow QA pass**
  - Scripted Playwright walk of the entire flow end-to-end on `expo start --web`;
    screenshot set of all 6 screens saved for a final visual compare against
    `reference_hifi_mockups.dc.html`
  - All prior test suites green in both `app/` and `backend/`
  - Optional: one iOS Simulator spot-check via the xcode MCP tools for a
    native-feel sanity check
  - Send the user the final screenshot set + a summary of anything still manual
    (real Upstash/Netlify credentials if not supplied in Phase 11, real brand
    audio/icons/font files to swap in for the placeholders)

- [ ] **Phase 13 — (stretch, optional) Build readiness**
  - App icon/splash assets, `app.json` metadata, EAS build config for real-device
    testing beyond Expo Go
  - Out of MVP scope per PRD (only requires Expo Go testability) — do this last,
    only if everything above is done and there's time left
