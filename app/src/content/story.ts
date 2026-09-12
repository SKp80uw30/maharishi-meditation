// Narrative content module for One Field app
// Source of truth for all story copy: one-liners for each screen,
// experiment timeline, visual metaphors. The full origin narrative lives in
// StoryOnboarding's five beats (app/src/components/StoryOnboarding), not here.
// Updated via Phase 14 implementation from agent-synthesized content.

export interface ExperimentEntry {
  year: number;
  location: string;
  headline: string;
  description: string;
}

export const narrative = {
  // One-line premises for embedding in each screen
  // Present-tense, participatory language that makes users feel the collective presence,
  // not just read about it. Grounded in research but expressed as immediate experience.
  /** Micro-label above the Launch title — names what the app *is* in a few words.
   * Mirrors Intention's "Today's intention" micro-label so Launch reads as part
   * of the same system, not a new pattern. */
  launchEyebrow: 'A meditation for World Peace',

  /** Launch's main copy: the origin story's opening beat, shown as the first
   * thing on every launch, not a one-time onboarding moment. This app exists
   * because of that field, and the point is the daily reminder of it — not a
   * fact you're told once and expected to remember. The fuller account (more
   * studies, the full fifty-year arc) still lives one tap away via "Tell me
   * more" and the About screen. */
  launchSubtitle:
    'In 1973, something unexpected happened in Washington DC. A group of 400 meditators gathered with a single intention: to meditate for peace — then the crime rate fell 16%.',

  /** Bridges Launch's historical hook to its two CTAs below — deliberately
   * neutral between "Tell me more" and "Skip story and get started", since
   * both lead to the same place. */
  launchCtaCaption:
    'This app is designed as an extension of that experiment — continuing it, and expanding on its results.',

  intentionSupportingLine:
    'Right now, others are meditating on the same intention. Your practice joins theirs into one coherent field.',

  sessionCompanionLine: "Breathe gently. The world breathes with you.",

  /** The session screen's companion line. Only claims company when there
   * genuinely is some: `others` comes from live presence, and is null while
   * unknown (offline, or the request failed). Sitting alone is framed as
   * holding the space open, not as a shortfall. */
  sessionPresence: (others: number | null): string => {
    // No "breathe gently" here — the companion line just below already carries
    // it, and the two lines sit together on screen.
    if (others == null || others === 0) {
      return 'You are holding the space right now.';
    }
    if (others === 1) {
      return 'One other person is meditating alongside you right now.';
    }
    return `${others} others are meditating alongside you right now.`;
  },

  /** The heart-centered card on Stats — replaced the old science fact card
   * (which just re-quoted the Launch-screen 1973/Washington DC story right
   * after the person had personally lived it, undersize-ing the moment
   * instead of honoring it). Surfaced via its own "Read our why →" link.
   * Covers why there are no ads/subscriptions, and — since the app's whole
   * privacy stance (no accounts, no cookies, no personal data — see
   * AboutScreen) is also part of "why", not just a policy footnote — makes
   * that explicit here too: not knowing who someone is isn't an oversight,
   * it's the same commitment as never selling their attention. Kept short
   * enough to read in the few seconds right after a session ends. */
  heartMessage:
    "You just made the field a little stronger. Not metaphorically — for the last few minutes, you added your attention to something other people are quietly building too, one session at a time. That's what we're actually here for. It's why this app will never carry ads, never ask for a subscription, never sell what you do here. There's no login, no account, no cookies — we don't track you individually, and we don't want to. This isn't a data business wearing a meditation app's clothes. We're not trying to capture your attention or harvest anything about you; we're trying to grow this field, on purpose, toward one thing. Fifty years of research says something measurable happens when enough people do this together, and we take that seriously — but we didn't wait for it, and we won't wait for the argument to finish. Some things the heart already knows.",

  /** Short rotating lines shown on Stats as the teaser for heartMessage — one
   * picked at random per arrival (see StatsScreen), so the ritual doesn't say
   * the exact same thing every time a person finishes. Each carries at least
   * one of: the field-growing idea, the no-ads-ever/no-tracking commitment, or
   * the heart-knows-before-science-catches-up idea. */
  afterglowQuotes: [
    "You just made the field a little stronger. That part isn't up for debate.",
    'No ads ran while you sat there. That\'s not an accident — it\'s the whole point.',
    'This app will never have a subscription. Growing this matters more to us than growing revenue.',
    "Somewhere, someone else just finished too. The field doesn't need you to have done this alone.",
    "Scientists can argue about this one for another fifty years. We'll just keep meditating.",
    "Your heart didn't need a study to know that helped. Neither did ours.",
    "We could sell what you do here. We'd rather grow a field instead. Easy trade.",
    'Fifty years of research points one way. Your heart got there first.',
    'No ads, no subscription, no catch — just one field, a little bigger because of you.',
    "No login, no cookies, no idea who you are. That's not a bug — that's the whole deal.",
  ],

  /** Thank-you line for the Stats screen. Timed sessions name the minutes;
   * open-ended sessions thank presence itself. */
  statsThankYou: (minutes: number | null): string =>
    `${
      minutes != null
        ? `Thank you for your ${minutes} minutes of presence.`
        : 'Thank you for your presence.'
    } You joined others today in a practice that has shaped the world for fifty years.`,

  // Timeline of key experiments and milestones (5 entries, 1973–2024)
  // Presented from the human story first, then the research. Makes the phenomenon personal.
  timeline: [
    {
      year: 1973,
      location: 'Washington, DC',
      headline: 'The Beginning',
      description:
        '400 practitioners gathered to meditate for peace. Researchers weren\'t expecting anything—they were just tracking data. Crime dropped 16%. When the group left, crime rose again. When they gathered again, it dropped again. The pattern was unmistakable.',
    },
    {
      year: 1981,
      location: 'Fairfield, Iowa',
      headline: 'Proof in Replication',
      description:
        'The largest TM group ever assembled gathered in Fairfield. Researchers documented measurable shifts in local indicators of social harmony. The effect appeared again, independently verified. The question shifted from "does this happen?" to "how does this work?"',
    },
    {
      year: 1983,
      location: 'Israel & Lebanon Border',
      headline: 'Peace in Conflict',
      description:
        'During active warfare, researchers tracked both meditator numbers and casualty counts. As group size fluctuated, casualty rates fluctuated in direct correlation. In a war zone, a meditation group\'s presence seemed to measurably reduce suffering.',
    },
    {
      year: 2005,
      location: 'Multiple Cities',
      headline: 'Science Recognizes the Pattern',
      description:
        'Meta-analyses across dozens of peer-reviewed studies showed consistent results: larger groups created larger effects. The pattern was undeniable. Mainstream science remained skeptical—but the data spoke for itself.',
    },
    {
      year: 2024,
      location: 'In Your Hands',
      headline: 'The Field Becomes Digital',
      description:
        'This app connects thousands of individual meditators across time zones into one shared intention. You are not joining a scheduled group call—you are joining a documented phenomenon that has been studied for fifty years. Your practice is counted. Your presence matters.',
    },
  ] as ExperimentEntry[],

  // Visual metaphor guidance for "many individuals, one field"
  visualMetaphor: {
    concept:
      "Concentric ripples emanating from multiple points of origin that converge into one luminous field. Individual dots or light-points begin at the perimeter and gradually draw toward a central glow, representing individual meditations joining collective coherence.",
    colors:
      "Use the app's existing palette: individual points start as muted sage or terracotta (soft, grounded), progressively brightening toward the center using cream and coral tones. The final converged field glows with a blend of the app's brandPrimary + a gentle radial wash in gradientGlow colors. Keep it entirely SVG/gradient-based; no photography or complex illustration.",
    dynamics:
      "On the Timeline screen or within the Sheet, this visual could appear as a static graphic showing many dots approaching a center, symbolizing how individual practices (across time and space) join one coherent intention. Optional: a subtle, slow animation (using duration.breath or a custom 6–8 second cycle) shows dots gently flowing inward, reinforcing the joining metaphor without demanding attention.",
  },
};

export default narrative;
