// Ported verbatim from design_handoff_world_peace_mvp/tokens/colors.css.
// Do not hand-edit hex values here without updating the source .css comment below —
// these are ground truth from the design handoff, not invented.

export const palette = {
  cream50: '#FFFCF8',
  cream100: '#FDF3E7',
  sand200: '#F5E6D3',
  sand300: '#EAD3B4',
  coral300: '#FFC1A6',
  coral400: '#FF9D7A',
  coral500: '#F97F5C',
  coral600: '#E36444',
  coral700: '#C24F33',
  amber300: '#FFDDAA',
  amber400: '#FFC98B',
  amber500: '#F7A94D',
  amber600: '#E08F2E',
  sage400: '#A9C1A0',
  sage500: '#87A97D',
  terracotta500: '#D97862',
  dusk400: '#A6AECB',
  dusk500: '#8791B5',
  ink900: '#3E332C',
  ink800: '#4B3F36',
  ink700: '#6B5D53',
  ink500: '#9C8C7E',
  ink300: '#C9BDAF',
  ink100: '#E7DFD5',
  white: '#FFFFFF',
} as const;

export const colors = {
  surfacePage: palette.cream50,
  surfaceCard: palette.white,
  surfaceSunken: palette.cream100,
  surfaceRaised: palette.white,
  surfaceOverlay: 'rgba(62,51,44,0.45)',

  brandPrimary: palette.coral500,
  brandPrimaryHover: palette.coral600,
  brandPrimaryPress: palette.coral700,
  brandSecondary: palette.amber500,
  brandSecondaryHover: palette.amber600,

  textPrimary: palette.ink900,
  textSecondary: palette.ink700,
  textTertiary: palette.ink500,
  textOnBrand: palette.white,
  textLink: palette.coral600,
  textLinkHover: palette.coral700,

  borderSubtle: palette.ink100,
  borderDefault: palette.sand300,
  borderStrong: palette.ink300,

  stateSuccess: palette.sage500,
  stateError: palette.terracotta500,
  stateInfo: palette.dusk500,

  // The one dark surface in the app — session screen only, meant to feel like
  // closed-eyes dusk. Same value as ink900 but named separately since it's used
  // as a *background*, not text, on that screen.
  sessionBackground: palette.ink900,
  sessionTextPrimary: palette.white,
  sessionTextSecondary: palette.cream100,
  sessionTextTertiary: palette.ink300,
} as const;

// Gradient stops, expressed for consumption by expo-linear-gradient (sunrise,
// a real linear gradient) and react-native-svg's <RadialGradient> (glow / dusk-glow,
// which are CSS radial-gradients with no direct RN equivalent).

/** linear-gradient(135deg, amber-300 0%, coral-400 55%, coral-600 100%) — hero marks */
export const gradientSunrise = {
  colors: [palette.amber300, palette.coral400, palette.coral600] as const,
  locations: [0, 0.55, 1] as const,
  // 135deg in CSS ≈ top-left to bottom-right
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

/** radial-gradient(circle at 30% 20%, ...) — soft warm wash behind light screens */
export const gradientGlow = {
  cx: '30%',
  cy: '20%',
  r: '75%',
  stops: [
    { offset: '0%', color: 'rgba(255,201,139,0.55)' },
    { offset: '45%', color: 'rgba(249,127,92,0.25)' },
    { offset: '75%', color: 'rgba(253,243,231,0)' },
  ],
};

/** radial-gradient(circle at 70% 30%, ...) — soft cool wash, session screen only */
export const gradientDuskGlow = {
  cx: '70%',
  cy: '30%',
  r: '70%',
  stops: [
    { offset: '0%', color: 'rgba(166,174,203,0.35)' },
    { offset: '70%', color: 'rgba(253,243,231,0)' },
  ],
};
