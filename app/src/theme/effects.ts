// Ported from design_handoff_world_peace_mvp/tokens/effects.css.
// Uses RN's `boxShadow` style prop (CSS box-shadow syntax, multi-layer supported —
// the New Architecture's replacement for the legacy shadowColor/shadowOffset/
// shadowOpacity/shadowRadius/elevation quintet) so these can be ported verbatim
// instead of approximated.

export const shadow = {
  s: '0px 1px 3px rgba(62,51,44,0.08), 0px 1px 2px rgba(62,51,44,0.06)',
  m: '0px 4px 12px rgba(62,51,44,0.10), 0px 2px 4px rgba(62,51,44,0.06)',
  l: '0px 12px 32px rgba(62,51,44,0.14), 0px 4px 8px rgba(62,51,44,0.06)',
  glowCoral: '0px 8px 30px rgba(249,127,92,0.35)',
  glowAmber: '0px 8px 30px rgba(247,169,77,0.30)',
} as const;

export const blurGlass = 14;

/** Cubic-bezier control points, usable with Easing.bezier(...) from
 * react-native/reanimated. */
export const easing = {
  standard: [0.4, 0, 0.2, 1] as const,
  outSoft: [0.16, 1, 0.3, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
};

export const duration = {
  fast: 150,
  normal: 280,
  slow: 500,
  /** Slow ~4s pace reserved for ambient/looping animation only (e.g. a subtle
   * breathing pulse on the session ring) — not for interactive UI feedback. */
  breath: 4000,
} as const;
