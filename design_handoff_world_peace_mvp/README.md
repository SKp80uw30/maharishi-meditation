# Handoff: World Peace Meditation App (MVP)

## Overview
A privacy-first, single-intention meditation app (Expo/React Native, iOS + Android). A person opens the app, begins a meditation "for World Peace" on their own schedule, meditates for a chosen duration (or open-ended), and afterward sees anonymous, collective participation counts. No accounts, no profiles, no stored history — see the PRD (`prd.md`, included) for full product rationale.

Core framing: this is **not** a scheduled/joined group session. Each person starts their own session whenever they like, and the app communicates that others are meditating **at the same time**, overlapping — not that everyone is on one synced clock.

## About the design files
The files in this bundle (`reference_hifi_mockups.dc.html`, `reference_wireframes.dc.html`, and everything in `components/`) are **design references built in HTML/React-like JSX**, not production code to copy verbatim. Your task is to **recreate these designs in Expo/React Native** (per the PRD's technical stack) using React Native primitives (`View`, `Text`, `Pressable`, `Animated`/Reanimated for motion) and whatever navigation/state library fits the codebase — not to embed HTML/CSS.

The `components/*.jsx` files use `React.createElement` and CSS-style inline objects (`var(--token)`, `borderRadius`, etc.) purely to describe intended layout, spacing, and hierarchy — treat the *values* (spacing, radii, colors, type scale) as ground truth and the *syntax* as illustrative only.

## Fidelity
**High-fidelity.** `reference_hifi_mockups.dc.html` and `components/*.jsx` carry final colors, typography, spacing, and copy — implement pixel-close. `reference_wireframes.dc.html` is an earlier low-fidelity structural exploration (sketchy/handwritten style, b&w) — kept only for flow-history context; do not use its visual style, only note where its structural options informed the final layout (e.g. the 2×2 duration grid, the breathing-ring session screen).

## Screens / views

### 1. Launch (`components/LaunchScreen.jsx`)
- **Purpose**: first thing a person sees; single action to begin.
- **Layout**: full-screen, centered column, `justifyContent:center`, `alignItems:center`, `padding:32`, background `--color-cream-50` with `--gradient-glow` radial wash behind content (`position:absolute; inset:0`).
- **Components**:
  - Hero mark: 120×120 blob shape (`border-radius: var(--radius-blob)` = `42% 58% 55% 45%/48% 42% 58% 52%`), fill `--gradient-sunrise`, shadow `--shadow-glow-coral`.
  - Title: "Maharishi Meditation", 28px/800 weight, `--text-primary`, `letter-spacing: -0.01em`.
  - Subtitle: "A shared meditation for World Peace." 16px (`--text-body-m`), `--text-secondary`, max-width 260px, margin-top 8px.
  - Primary button "Begin": pill (`border-radius: 999px`), fill `--brand-primary`, white text, 17px/700, padding `16px 40px`, shadow `--shadow-glow-coral`, no border.
- **Content**: exact copy above; no explanatory text beyond the subtitle.

### 2. World Peace intention confirmation (`components/IntentionScreen.jsx`)
- **Purpose**: emotional anchor — confirms the (only) intention, doesn't ask the user to choose one.
- **Layout**: full-screen column, padding `28px 28px 40px`, back arrow (←) top-left (`fontSize:22`, `--text-tertiary`, transparent background).
- **Components**:
  - Centered block: micro-label "Today's intention" (12px/700 uppercase, `letter-spacing:0.04em`, `--brand-primary`), then headline "What energy are you sending into the world today?" (26px/800, `line-height:1.3`).
  - Card: white surface (`--surface-card`), radius `--radius-l` (20px), shadow `--shadow-m`, padding 24, containing "World Peace & Non-violence" (17px/800, `--text-heading-s`) and supporting line "Whenever you begin, you meditate alongside others doing the same, right now." (14px, `--text-secondary`).
  - Primary button "Begin your session" — same pill style as Launch, full-width, bottom-anchored.
- **Copy note**: CTA deliberately reads "Begin your session," not "Join today's session" — reinforces that each person starts independently.

### 3. Duration selection (`components/DurationScreen.jsx`)
- **Purpose**: pick a session length.
- **Layout**: column, back arrow top-left, centered content: title "Choose your duration" (22px/800), then a 2-column grid (`gap:14`) of 4 fixed durations (3/5/10/20 min) plus a 5th **"Open"** button spanning both columns (`gridColumn:'1 / -1'`) below the grid.
- **Components**: each duration button — unselected: 1.5px border `--border-default`, white surface, `--text-primary`; selected: no border, fill `--brand-primary`, white text, shadow `--shadow-glow-coral`. Number 20px/800 + "minutes" caption 12px/600 below it. The Open button reads "Open" (18px/800) + caption "meditate as long as you like" (12px/600), same selected/unselected treatment.
- **Behavior**: selecting "Open" means the following Session screen runs an open-ended (count-up, no auto-end) timer instead of a countdown.
- Bottom-anchored primary button "Begin meditation."

### 4. Meditation session (`components/SessionScreen.jsx`)
- **Purpose**: on-device timer, calm and uncluttered.
- **Layout**: full-bleed **dark** screen (`--color-ink-900`) — the only dark surface in the app, meant to feel like closed-eyes dusk — with `--gradient-dusk-glow` wash behind content.
- **Components**:
  - Sound toggle pill, top-right (`position:absolute; top:24; right:24`): reads "Sound on" / "Sound off," translucent white background when on, transparent when off, 1.5px border `rgba(255,255,255,.25)`, `--color-cream-100` text.
  - Ring: 220×220 circle. **Timed mode**: `conic-gradient` progress arc in `--color-coral-400` over `rgba(255,255,255,.12)` track, proportional to elapsed time. **Open mode**: flat `rgba(255,255,255,.12)` fill, no progress (there's no total to measure against).
  - Inner circle (188×188, same ink-900 fill) shows `MM:SS` (38px/800, white) — counts **down** in timed mode, counts **up** in Open mode — and a caption below it: "World Peace" (timed) or "Open session" (Open mode), 12px uppercase, `letter-spacing:0.04em`, `--color-ink-300`.
  - Supporting line: "Breathe gently. Others are meditating alongside you right now." (+ ", A gentle ambient tone plays as you go." appended only when sound is on) — 16px, `--color-cream-100`, max-width 260px.
  - Secondary button "End early" (timed) / "End session" (Open) — pill, transparent fill, 1.5px `rgba(255,255,255,.25)` border, `--color-cream-100)` text.
- **Behavior**: timed mode auto-advances to Reflection & stats at 0:00; Open mode only ends when the person taps "End session."
- **Tweakable**: sound on/off is a real toggle affecting in-app ambient audio (not just copy) — implement as user-controlled state, default **on**.

### 5. Reflection & stats (`components/StatsScreen.jsx`)
- **Purpose**: the only screen that depends on the backend — shows anonymous collective participation after a session.
- **Layout**: column, centered, padding `32px 28px 40px`, gap 20.
- **Components**:
  - Small 64×64 blob mark (`--gradient-sunrise`, `--radius-blob`).
  - Heading "Session complete" (24px/800).
  - Supporting line: "Thank you for your `{N}` minutes." (timed) or "Thank you for your session." (Open), followed by "Others were meditating alongside you at the same time." (16px, `--text-secondary`, max-width 260).
  - Two stat rows, each a white card (`--surface-card`, radius `--radius-l`, shadow `--shadow-m`, padding 20, `flex-row`, `justify-content:space-between`): "World Peace meditations today" → count in `--brand-primary` 22px/800; "All time" → count in `--text-primary` 22px/800.
  - Bottom-anchored primary button "Meditate again" (pill, `--brand-primary`, shadow `--shadow-glow-coral`).
- **Backend note**: per PRD, this screen calls the aggregate-increment endpoint (`POST /meditations/world-peace`) and fetches stats (`GET /stats/world-peace`) — see PRD "Backend architecture" for the exact contract (`total_today`, `total_all_time`, optional `current_active_estimate`).

### Bonus: About & privacy (`components/AboutScreen.jsx`)
- **Purpose**: not in the PRD's 5-step flow, but needed for a shippable app — explains the privacy promise and the Maharishi Effect naming, reachable via a small info affordance from Launch (not part of the core linear ritual).
- **Layout**: column, back arrow top-left, two stacked cards (same white/shadow/radius treatment as other cards): "Privacy, simply" (no accounts/location/personal data — only an anonymous count is added) and "About the practice" (the Maharishi Effect framing). Footer line: version + tagline, `--text-tertiary`, centered.

## Interactions & behavior
- Linear flow: Launch → Intention → Duration → Session → Stats → (loop back to Duration via "Meditate again," or to Launch).
- Back arrow present on Intention, Duration, and About; none on Launch, Session (use "End early/End session" instead), or Stats.
- No tab bar, no persistent nav — this is a single guided ritual, not a tabbed app.
- Duration selection is in-memory only; not sent to the backend.
- Session timer runs fully on-device; no network calls during meditation.
- Ending early or reaching 0:00 both proceed to Stats (PRD flags choosing exactly one increment trigger — recommend incrementing on session start or completion, not both; pick one and document it in code).
- Sound toggle default **on**; persists only for the current session (no account to persist to).
- Motion: use `--ease-standard` for standard UI transitions, `--ease-out-soft` for toggle-like feedback, `--duration-fast`/`--duration-normal` for interactive feedback, and a slow ~4s "breath" pace only for ambient/looping animation (e.g. if a subtle breathing pulse is added to the session ring).

## State management
- `duration`: `number | 'open'` — chosen on the Duration screen, consumed by Session and Stats.
- `secondsElapsed` / `secondsLeft`: transient, on-device only, lives for the duration of the Session screen.
- `soundOn`: boolean, defaults true, session-scoped.
- Stats payload (`total_today`, `total_all_time`, optional `current_active_estimate`): fetched/updated only on the Stats screen — no other screen needs network state.
- No persisted client store, no auth state, no user identifiers anywhere (see PRD "Privacy and trust requirements").

## Design tokens
All values below are CSS custom properties in `tokens/*.css` (copied verbatim from the design system) — translate to your RN theme/style constants.

**Color** (`tokens/colors.css`)
- Backgrounds: cream `#FFFCF8` (page), white (`#FFFFFF`, cards), dark ink `#3E332C` (session screen only).
- Brand: coral `#F97F5C` (primary, hover `#E36444`, press `#C24F33`), amber `#F7A94D` (secondary, hover `#E08F2E`).
- Text: ink-900 `#3E332C` (primary), ink-700 `#6B5D53` (secondary), ink-500 `#9C8C7E` (tertiary).
- Semantic (muted, never alarm colors): sage `#87A97D` (success), terracotta `#D97862` (error), dusk `#8791B5` (info).
- Gradients: sunrise (amber→coral diagonal, hero marks), glow (soft radial warm wash, light screens), dusk-glow (soft radial cool wash, session screen only).

**Typography** (`tokens/typography.css`)
- Family: Nunito, weights 300–800 (see `tokens/fonts.css` for the Google Fonts import — flagged as a placeholder pending real brand font files).
- Scale: display 28–64px, heading 17–24px, body 14–18px, caption 12px.
- Line-height: 1.15 (tight, display) to 1.65 (relaxed, long copy).

**Spacing & radius** (`tokens/spacing.css`)
- Spacing scale: 4/8/12/16/20/24/32/40/48/64/80/96px.
- Radius: 8px (s) / 14px (m) / 20px (l) / 28px (xl) / pill (999px, buttons & tags) / blob (`42% 58% 55% 45%/48% 42% 58% 52%`, hero marks only).

**Effects** (`tokens/effects.css`)
- Shadows: s/m/l ambient warm-tinted elevations, plus `shadow-glow-coral`/`shadow-glow-amber` (primary CTAs and hero marks only).
- Motion: standard ease `cubic-bezier(.4,0,.2,1)`, soft-out ease `cubic-bezier(.16,1,.3,1)`, durations 150/280/500ms, breath 4000ms.

## Assets
No photography, no icon library shipped in this handoff — the design intentionally avoids photography (private/inward feeling, not aspirational-lifestyle). The only "imagery" is the gradient/glow treatments above. If glyphs are needed (back arrow, mute icon, close), the design system references Phosphor Icons (fill weight) as a placeholder — confirm or swap for real brand iconography before shipping.

## Files in this bundle
- `README.md` — this file.
- `prd.md` — original product requirements doc (source of truth for scope, non-goals, backend contract, privacy rules).
- `reference_hifi_mockups.dc.html` — open in a browser to see all 6 screens rendered together, high-fidelity.
- `reference_wireframes.dc.html` — earlier low-fidelity structural exploration; historical context only.
- `components/LaunchScreen.jsx`, `IntentionScreen.jsx`, `DurationScreen.jsx`, `SessionScreen.jsx`, `StatsScreen.jsx`, `AboutScreen.jsx`, `PhoneFrame.jsx` — per-screen design reference source (JSX/inline-style syntax, React Native equivalents to be written from scratch).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css` — the full token set referenced throughout this README.
