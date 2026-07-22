// Ported verbatim from design_handoff_world_peace_mvp/tokens/spacing.css.

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radius = {
  s: 8,
  m: 14,
  l: 20,
  xl: 28,
  pill: 999,
  // CSS blob radius is `42% 58% 55% 45%/48% 42% 58% 52%` — an elliptical
  // per-corner border-radius RN cannot express with a plain `borderRadius`.
  // Handled by the <BlobMark> svg primitive instead; kept here only as a
  // reference pointer, not a usable numeric value.
  blob: 'see <BlobMark> in app/src/components — not a plain radius value',
} as const;
