# Collective Meditation App PRD

## Product overview

This product is a privacy-first mobile meditation app built for iOS and Android from a single Expo/React Native codebase, with an MVP flow centered on a simple collective ritual: launch, enter a World Peace meditation flow, choose a duration, meditate, and then view community participation stats.[cite:17][cite:16]

The core product idea is that a user opens the app to join a shared meditation for World Peace, completes a session, and sees that they are part of a larger collective practice without creating an account or giving up personal data.[cite:16][cite:17]

## Vision

Create a minimal, calm, cross-platform meditation experience that makes private meditation feel socially meaningful by showing anonymous collective participation around a single shared intention: World Peace.[cite:16]

The MVP should feel emotionally resonant and spiritually open-ended, while remaining technically simple enough to build and test quickly in Expo Go.[cite:17][cite:16]

## Problem statement

Most meditation apps are built around content libraries, subscriptions, user profiles, streaks, and individual habit optimization.[cite:17] This product is different: its main value is the feeling that a person is joining others in a shared act of meditation for World Peace, with the app providing just enough structure and feedback to make that collective effect visible.[cite:16]

The design challenge is to preserve that feeling without introducing complexity that weakens trust, privacy, or speed to launch.[cite:16]

## Product principles

- Privacy-first by design: the product should not need to know who the user is, where they are, or any other personal information.[cite:16]
- Simplicity over feature breadth: the MVP should focus on one core ritual flow rather than a wide set of wellness features.[cite:17]
- One codebase, two platforms: the app should be built in Expo/React Native and run on both Apple and Android devices.[cite:17]
- Minimal backend: the backend should exist only to maintain anonymous aggregate World Peace counts and return simple stats.[cite:16]
- Inspiring social proof: the numbers shown after meditation should reinforce a feeling of participating in something larger than oneself.[cite:16]
- One intention for MVP: the first release should be explicitly about World Peace, not a menu of causes or themes.[cite:16]

## Users and use cases

The initial user is someone open to meditation, ritual, mindfulness, or collective intention, but who does not need a large guided content library to begin.[cite:17] The app should remain accessible to both spiritually oriented users and more secular users by framing the experience around participation in a shared World Peace meditation rather than requiring belief in any specific metaphysical claim.[cite:17][cite:16]

Primary use cases:

- Open the app and begin a World Peace session within seconds.[cite:17][cite:16]
- Choose to participate in the shared World Peace intention.[cite:16]
- Meditate for a chosen duration with a calm, uninterrupted timer experience.[cite:17][cite:16]
- Finish the session and view simple collective numbers for World Peace meditations.[cite:16]

## MVP scope

The MVP user flow is:

1. Launch
2. World Peace intention confirmation
3. Duration selection
4. Meditation session
5. Reflection and global stats.[cite:17][cite:16]

For MVP, the product should be explicit and opinionated: the app is about World Peace meditation.[cite:16] There should not be a multi-topic intention picker in the first release.[cite:16]

The single featured intention for MVP is **World Peace & Non-violence**.[cite:16][cite:18] This topic should be hard-coded into the product experience, backend model, and stats presentation so that all early usage contributes to the same shared number.[cite:16]

This concentration is strategically important because it keeps the experience simple, avoids choice friction, and makes the community numbers more inspiring by pooling all participation into one visible stream.[cite:16]

## Non-goals for MVP

The following are out of scope for the first release:

- Multiple intentions or cause categories.[cite:16][cite:18]
- Accounts and authentication.[cite:16]
- User profiles or stored identity.[cite:16]
- Friends, messaging, or social graph features.[cite:17]
- Detailed behavioral analytics.[cite:16]
- Stored meditation history per user.[cite:16]
- Large guided content catalogs, courses, or subscription-heavy feature sets.[cite:17]
- Complex recommendation systems or personalization engines.[cite:16]

## User experience requirements

### 1. Launch screen

The launch screen should feel calm, lightweight, and inviting, with a clear action to begin the ritual.[cite:17] It should communicate that this is a meditation experience for World Peace in a few words without overwhelming the user with explanation or options.[cite:16]

### 2. World Peace intention confirmation

This is the emotional anchor of the MVP. Rather than asking users to choose from several global intentions, the app should explicitly orient them around one shared meditation focus: World Peace & Non-violence.[cite:16]

The screen can still use evocative copy such as “What energy are you sending into the world today?” but in MVP the answer is already framed by the product: the user is joining a World Peace meditation.[cite:18][cite:16]

Suitable supporting copy includes:

- “Today, you’re joining others in meditation for World Peace.”[cite:16]
- “Your session adds to the global World Peace count.”[cite:16]
- “One intention. One shared field of practice.”[cite:16]

The screen should confirm the shared topic, not branch into multiple alternatives.[cite:16]

### 3. Duration selection

Users should be able to choose a short meditation duration through a minimal UI.[cite:17] The duration selection is part of the local experience and does not need to be transmitted to the backend for MVP.[cite:16]

### 4. Meditation session

The meditation timer and session experience should run entirely on-device.[cite:16] The app should not require network activity during the meditation itself other than any optional initial stat fetches or final aggregate count update.[cite:16]

The meditation state should remain simple: the user starts, the timer runs, and the experience stays uncluttered.[cite:17] There is no need to store individual session completion data on the server in the MVP architecture.[cite:16]

### 5. Reflection and stats

After the user starts the session or completes it, the app should call the aggregate increment endpoint and then show collective participation stats for World Peace meditation.[cite:16] The stats screen is the only step in the core flow that depends on the backend.[cite:16]

The MVP stats view should prioritize clarity over sophistication and may include:

- Total World Peace meditations today.[cite:16]
- Total World Peace meditations all time.[cite:16]
- Optional current active World Peace estimate, if implemented.[cite:16]

The reflection component should be brief and supportive rather than journal-heavy, keeping the focus on shared participation rather than stored personal content.[cite:17][cite:16]

## Functional requirements

### Core requirements

- The app must run from one Expo/React Native codebase across iOS and Android.[cite:17]
- The app must support the five-step core flow: launch, World Peace intention confirmation, duration, meditate, stats.[cite:17][cite:16]
- The app must be explicitly centered on World Peace & Non-violence as the only MVP intention.[cite:16]
- The app must work without login or account creation.[cite:16]
- The app must maintain a calm and minimal interface suitable for meditation.[cite:17]
- The app must show anonymous collective participation numbers after a session action.[cite:16]

### Backend-facing requirements

- The client must be able to increment an anonymous aggregate count for World Peace meditations.[cite:16]
- The client must be able to fetch World Peace stats with minimal payloads.[cite:16]
- The client should not be required to send user ID, email, device identity, profile data, or location data.[cite:16]
- The app should be able to function meaningfully even if advanced analytics infrastructure is absent.[cite:16]

## Backend architecture

The backend should be designed around a single simple public increment endpoint for the single MVP topic, for example `POST /meditations/world-peace`, which increments the World Peace counter and returns updated aggregate stats or a minimal success response.[cite:16]

A companion read endpoint such as `GET /stats/world-peace` should return the simple numbers needed by the stats screen, including `total_today`, `total_all_time`, and optionally `current_active_estimate`.[cite:16]

The request body does not need user identifiers, location, or rich metadata, and for MVP the topic should be implied directly by the URL rather than duplicated in the request body.[cite:16]

This architecture is intentionally narrow: the backend is not a user system, profile system, messaging system, or event-tracking system. It is an anonymous aggregate counting service for World Peace meditation participation.[cite:16]

## Data model

For MVP, the core stored object is not a user record or a detailed meditation session record. The meaningful persisted unit is an aggregate count for World Peace keyed by time bucket.[cite:16]

A minimal model can support:

- Topic key fixed to `WORLD_PEACE` for MVP.[cite:16]
- Time bucket, such as day or minute depending on the aggregation strategy.[cite:16]
- Aggregate count for World Peace meditations in that time bucket.[cite:16]
- Derived totals such as all-time total and daily total.[cite:16]

If `current_active_estimate` is added, it should be treated as a derived product metric rather than proof of exact real-time presence.[cite:16]

The conceptual model may later expand to other topics, but the MVP data model should be implemented as if World Peace is the sole supported topic in practice.[cite:16]

## Frontend architecture

The frontend should use a very simple screen stack that mirrors the product flow: launch, World Peace confirmation, duration, meditate, stats.[cite:16][cite:17] The mobile app needs only a minimal API client and ephemeral in-memory state during the session.[cite:16]

There should be no requirement for persistent signed-in state, profile syncing, or complex client-side data stores in the MVP.[cite:16] This keeps the architecture appropriate for a fast, testable Expo build.[cite:17][cite:16]

Because the intention is fixed for MVP, the frontend should not include topic selection logic beyond any internal constant or configuration needed to call the World Peace endpoints.[cite:16]

## Privacy and trust requirements

The privacy promise is central to the product and must match the implementation. The app should not collect who the user is, where they are, or any unnecessary identifying information.[cite:16]

Specific privacy requirements:

- No accounts, email addresses, usernames, or personal identity fields in MVP.[cite:16]
- No location collection in support of the core meditation flow.[cite:16]
- No user identifiers required in API requests.[cite:16]
- No default collection of detailed behavioral telemetry beyond aggregate World Peace meditation counts.[cite:16]

Any crash or error logging should be configured to avoid storing user identifiers or sensitive content and should be treated as technical diagnostics rather than behavioral analytics.[cite:16]

## Analytics requirements

Analytics for MVP should be intentionally minimal and aligned with the product story.[cite:16] From the product perspective, the only truly meaningful persisted data is how many World Peace meditations occurred in each time bucket.[cite:16]

Recommended MVP metrics:

- Aggregate World Peace meditations per day.[cite:16]
- Aggregate World Peace meditations all time.[cite:16]
- Optional estimated active World Peace count if useful and technically simple.[cite:16]

The product should disable or strip analytics that capture IDs, IP geolocation, or detailed behavioral tracking by default.[cite:16]

## Content and copy guidance

The copy should preserve the app's distinctive identity around collective intention without becoming so esoteric that it excludes mainstream meditation users.[cite:17][cite:18] In MVP, that identity should be grounded explicitly in a shared meditation for World Peace rather than spread across several causes.[cite:16]

Examples of suitable themes include:

- “Meditate for World Peace.”[cite:16]
- “Join today’s shared World Peace session.”[cite:16]
- “Your meditation adds to the collective World Peace count.”[cite:16]
- “What energy are you sending into the world today?” used as framing copy above or alongside the fixed World Peace focus.[cite:18][cite:16]

The product should avoid cluttering the early experience with too much doctrine, explanation, or too many conceptual choices.[cite:17][cite:18]

## Technical stack

### Mobile

- Expo / React Native for one shared codebase across iOS and Android.[cite:17]
- Testable in Expo Go during MVP development.[cite:17]

### Backend

- Minimal HTTP API, potentially serverless or otherwise lightweight, dedicated to World Peace aggregate counting and stats retrieval.[cite:16]

### State and storage

- On-device transient state for the active meditation flow.[cite:16]
- Server-side aggregate counts only, not user-level histories.[cite:16]

## Success criteria

The MVP is successful if users can quickly understand that the app is about joining a shared meditation for World Peace, complete a session, and find the collective stats motivating enough to make the experience feel meaningful.[cite:16][cite:17]

Initial success should be evaluated through product simplicity, emotional clarity, and whether the anonymous World Peace participation numbers create inspiration rather than confusion.[cite:16][cite:17]

Useful early indicators include:

- World Peace meditation starts.[cite:16]
- Growth in total World Peace meditation count over time.[cite:16]
- Qualitative user response to the World Peace framing and collective stats experience.[cite:16][cite:17]

## Risks and open questions

- Whether the aggregate increment should happen on session start, session completion, or both, with the current recommendation being to choose one simple event for MVP.[cite:16]
- How prominently to frame the collective-effect narrative so the product remains inviting to both spiritual and secular users.[cite:17][cite:16]
- Whether `current_active_estimate` adds meaningful inspiration or unnecessary complexity in the first release.[cite:16]
- When, if ever, the product should expand beyond World Peace into additional intention categories.[cite:16][cite:18]

## Recommended MVP decision set

The cleanest recommended MVP is:

- One Expo/React Native app for iOS and Android.[cite:17]
- One explicit shared intention: World Peace & Non-violence.[cite:16][cite:18]
- One minimal increment endpoint for anonymous aggregate counts: `POST /meditations/world-peace`.[cite:16]
- One simple stats endpoint for totals: `GET /stats/world-peace`.[cite:16]
- No auth, no profile, and no personal data collection.[cite:16]
- On-device timer and meditation experience, with backend involvement only for stats-related actions.[cite:16]

This version best preserves the product's identity while keeping the build genuinely small, testable, and privacy-aligned.[cite:16][cite:17]
