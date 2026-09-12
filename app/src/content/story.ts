// Narrative content module for One Field app
// Source of truth for all story copy: one-liners for each screen,
// full origin narrative, experiment timeline, visual metaphors.
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
   * studies, the full fifty-year arc) still lives one tap away via Intention's
   * "Go deeper" and the About screen. */
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

  statsFactCard:
    'For fifty years, researchers have tracked something remarkable: when groups meditate together on one intention, measurable shifts occur in the surrounding world. You are part of this documented lineage.',

  /** Thank-you line for the Stats screen. Timed sessions name the minutes;
   * open-ended sessions thank presence itself. */
  statsThankYou: (minutes: number | null): string =>
    `${
      minutes != null
        ? `Thank you for your ${minutes} minutes of presence.`
        : 'Thank you for your presence.'
    } You joined others today in a practice that has shaped the world for fifty years.`,

  // Full origin story (~400 words) for the deep-dive Sheet/Modal
  // Opened with the human story, not the academic framing. Makes the phenomenon personal.
  originStory: `
In 1973, something unexpected happened in Washington DC.

A group of 400 meditation practitioners gathered with a single intention: to meditate for peace. The researchers tracking the city weren't looking for miracles. They were collecting data—crime rates, accident rates, social disturbance indices. Just numbers.

But the numbers shifted. Crime dropped 16%. When the group dispersed, the numbers rose again. When they gathered again, the numbers fell.

The world noticed.

For the next fifty years, researchers studied this pattern. They found it in Lebanon during the war. They found it in multiple American cities. They found it in Israel, in the Philippines, across cultures and decades. The pattern was consistent: when groups meditated together in coherent intention, something in the surrounding world seemed to shift.

In the 1950s, Maharishi Mahesh Yogi brought Transcendental Meditation from ancient Vedic tradition to the modern world. His core teaching was simple: consciousness is the foundation of all existence. When one mind becomes coherent, something shifts. But what happens when many minds become coherent together?

The researchers began to answer that question. They called the effect the Maharishi Effect—not named after mystical belief, but after decades of documented observation. The evidence is contested by mainstream science. Some researchers argue the studies have flaws. Others have replicated the findings. The phenomenon remains scientifically debated.

But the pattern persists.

This app exists to make that lineage visible. When you meditate for World Peace, you join thousands of others doing the same—not on a scheduled group call, but overlapping in time, each person holding their own intention within a shared field. You're not alone in a private practice. You're part of a documented, fifty-year experiment in collective consciousness.

Each session you complete adds your presence to the field. The numbers you see are not abstract—they are evidence that your practice is real, counted, and part of something larger than yourself.

The Maharishi Effect began with 400 people in one city. Today, it lives in an app. Your breath joins with thousands of others, across time zones and continents, all holding the same intention: World Peace. The research continues. And you are in it.
  `.trim(),

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
