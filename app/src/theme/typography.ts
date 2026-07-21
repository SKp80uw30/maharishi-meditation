// Ported from design_handoff_world_peace_mvp/tokens/typography.css.
// Font family: Nunito — see tokens/fonts.css. Placeholder pending real brand font
// files (flagged as such in the original design handoff); loaded via
// @expo-google-fonts/nunito in app/App.tsx.

export const fontFamily = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  light: 'Nunito_300Light',
} as const;

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// text-display-xl was `clamp(40px, 6vw, 64px)` in CSS (viewport-responsive); RN has
// no viewport units, so it's fixed at a sensible phone-width value.
export const fontSize = {
  displayXl: 48,
  displayL: 36,
  displayM: 28,
  headingL: 24,
  headingM: 20,
  headingS: 17,
  bodyL: 18,
  bodyM: 16,
  bodyS: 14,
  caption: 12,
} as const;

export const lineHeight = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.65,
} as const;

/** CSS used em-based letter-spacing; RN's letterSpacing is in points, so these are
 * converted per font size at call time via `tracking()` below rather than stored
 * as fixed px. */
export const trackingEm = {
  tight: -0.01,
  normal: 0,
  wide: 0.04,
} as const;

/** Convert a tracking token (an em multiplier) to RN points for a given font size. */
export function tracking(em: number, fontSize: number): number {
  return Math.round(em * fontSize * 100) / 100;
}

/** Absolute line height in points for a given font size + line-height multiplier. */
export function leading(multiplier: number, fontSize: number): number {
  return Math.round(multiplier * fontSize);
}
