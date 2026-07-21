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

- [ ] **Phase 1 — Design tokens & primitive components**
  - Port `design_handoff_world_peace_mvp/tokens/*.css` verbatim into
    `app/src/theme/{colors,typography,spacing,effects}.ts`
  - Build primitives in `app/src/components/`: `Button` (primary pill / secondary
    outline, per Launch/Intention/Duration/Stats/Session button variants), `Card`,
    `ScreenContainer`, `BlobMark` (svg, approximates the CSS blob radius), `GradientGlow`
    (svg radial, light screens) / `GradientSunrise` (linear, hero marks) /
    `GradientDuskGlow` (svg radial, session screen), `ProgressRing` (svg, conic-style
    arc via stroke-dasharray)
  - Delete the placeholder `src/__tests__/smoke.test.ts` once real tests exist
  - **Gate:** `npx tsc --noEmit` clean · `npx jest` — render test per primitive
    (renders without throwing, applies expected style/props)

- [ ] **Phase 2 — App shell / state machine**
  - `app/src/state/appReducer.ts`: pure reducer over
    `{screen, duration, secondsLeft, secondsElapsed, soundOn}` with actions for the
    full linear flow (begin, continue, select duration, start session, tick, finish,
    end early, restart, open/close about, back)
  - `App.tsx` wires the reducer and switch-renders the current screen (still
    placeholder screens at this point)
  - **Gate:** `npx jest` — reducer unit tests cover every transition in the design
    README's "Interactions & behavior" section, including back nav and the
    Stats→"Meditate again"→Duration loop

- [ ] **Phase 3 — Launch screen**
  - Hero blob, title "Maharishi Meditation", subtitle, "Begin" pill button, plus a
    small info affordance to About (README requires About be reachable from Launch;
    `LaunchScreen.jsx` itself doesn't show this control — added per README, not the
    literal JSX)
  - **Gate:** render test (copy/labels present, Begin fires the right action) +
    Playwright screenshot on `expo start --web` vs. `reference_hifi_mockups.dc.html`

- [ ] **Phase 4 — Intention screen**
  - Micro-label, headline, intention card ("World Peace & Non-violence" + supporting
    line), "Begin your session" CTA, back arrow → Launch
  - **Gate:** same pattern as Phase 3

- [ ] **Phase 5 — Duration screen**
  - 2×2 grid (3/5/10/20 min) + full-width "Open" option, selected/unselected
    styling per spec, "Begin meditation" gated on a selection being made
  - **Gate:** interaction tests (selecting each option updates state correctly) +
    screenshot

- [ ] **Phase 6 — Session screen + timer hook**
  - `app/src/hooks/useSessionTimer.ts`: countdown (timed) / count-up (Open),
    isolated from the component for `jest.useFakeTimers` testing
  - Dark screen, svg progress ring wired to elapsed %, MM:SS, sound toggle pill
    (wiring only — actual audio is Phase 7), auto-advance to Stats at 0:00 (timed),
    "End early"/"End session" button
  - **Gate:** hook unit tests (timed mode reaches 0 and fires finish exactly once;
    Open mode counts up indefinitely until told to stop) + dark-UI screenshot

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
