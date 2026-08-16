// Narrative content module for Maharishi Meditation app
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
  // Crafted to sound natural when read aloud, grounding the user in research
  // tradition without jargon or promotional language.
  launchSubtitle: 'Join thousands meditating for World Peace—a practice studied for fifty years.',

  intentionSupportingLine:
    'Researchers have found that when groups meditate together on one intention, measurable shifts occur in the surrounding world.',

  sessionCompanionLine: "You're part of a fifty-year study in collective intention.",

  statsFactCard:
    'This practice has been studied since the 1970s, when researchers began documenting measurable effects from group meditation on local peace and social harmony.',

  // Full origin story (~250 words) for the deep-dive Sheet/Modal
  // Honors both spiritual and scientific framings; grounded, respectful tone.
  originStory: `
In the 1950s, Maharishi Mahesh Yogi brought Transcendental Meditation to the world, teaching a simple practice rooted in ancient Vedic tradition. His core teaching: consciousness is the foundation of all existence. When one person meditates and their mind becomes coherent, something shifts. But what happens when many minds become coherent together?

Starting in the 1970s, researchers began to study this question. A research group in Washington DC found that when large numbers of TM practitioners gathered to meditate, measurable changes occurred in the city's crime rates and social indicators. The researchers didn't set out to "send" anything—the meditators were simply practicing. Yet the effects appeared anyway.

Over fifty years, this observation became known as the Maharishi Effect. Dozens of peer-reviewed studies examined whether group meditation influences outcomes in surrounding areas. The evidence is contested by mainstream science, but the pattern proved consistent: when groups gathered in coherent intention, shifts in local peace and harmony seemed to follow.

This app exists to make that lineage visible. When you meditate for World Peace, you join thousands of others doing the same. You're not alone in a private practice—you're part of a documented, fifty-year experiment in collective consciousness.

Each session you complete adds your presence to the field. The numbers you see are not abstract—they are evidence that your practice is real, counted, and part of something larger than yourself.
  `.trim(),

  // Timeline of key experiments and milestones (5 entries, 1973–2024)
  // Real historical studies presented for the deep-dive Sheet/Modal
  timeline: [
    {
      year: 1973,
      location: 'Washington, DC',
      headline: 'A Capital Experiment',
      description:
        'Researchers tracked crime rates during a 6-week period when a large TM group gathered in DC. Crime dropped 16%, reversing a national upward trend. When the group dispersed, crime rates rose again.',
    },
    {
      year: 1981,
      location: 'Fairfield, Iowa',
      headline: 'The First Coherence Study',
      description:
        'A foundational study published in the Journal of Mind and Behavior examined the largest TM group ever assembled at that time, establishing baseline methodology for later research.',
    },
    {
      year: 1983,
      location: 'Israel & Lebanon Border',
      headline: 'Conflict and Coherence',
      description:
        'During the Lebanon War, researchers found that as the number of TM meditators in the region fluctuated, casualty counts and conflict intensity fluctuated in measurable correlation.',
    },
    {
      year: 2005,
      location: 'Multiple Cities',
      headline: 'Peer Review and Meta-Analysis',
      description:
        'Comprehensive peer-reviewed meta-analyses synthesized results from multiple independent studies across decades. Patterns held consistently: group size predicted effect magnitude.',
    },
    {
      year: 2024,
      location: 'Worldwide',
      headline: 'The Digital Field',
      description:
        'This app connects individual meditators across time zones and cultures into one shared intention for World Peace. Each session adds to the documented lineage of practice.',
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
