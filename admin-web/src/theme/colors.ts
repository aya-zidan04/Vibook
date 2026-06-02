/**
 * Admin theme palette — mirrors mobile `paletteColors.ts`.
 * CSS variables in `palette-colors.css` / `dark-semantics.css` are the runtime source of truth.
 */

export const lightPalette = {
  neonYellow: '#F0FB45',
  limeGreen: '#A7DC2B',
  grassGreen: '#8BC249',
  mintOffWhite: '#EEF8E2',
  paleBone: '#F1F7E7',
  softMint: '#EEF8E2',
  pastelSage: '#E4EFD4',
  navSage: '#E4EFD4',
  navSageDeep: '#DDE8CB',
  white: '#FFFFFF',
  charcoal: '#1F1F1F',
  graySecondary: '#5C5C5C',
  grayMuted: '#757575',
  neutralHover: '#F5F5F5',
  neutralMuted: '#FAFAFA',
  black: '#000000',
  navSidebarBg: '#B0C19B',
  navSidebarHover: '#BDC9AD',
  navSidebarActive: 'rgba(255, 255, 255, 0.55)',
  navSidebarText: '#1F1F1F',
  navSidebarTextSecondary: '#3D4A38',
  navSidebarIcon: '#263322',
  navHeaderBg: '#C1D0B2',
  navHeaderText: '#1F1F1F',
  navHeaderTextSecondary: '#4A5646',
  navChromeBorder: 'rgba(26, 35, 24, 0.16)',
  navSidebarEdge: 'rgba(26, 35, 24, 0.14)',
} as const;

/** Dark mode — 7 swatches from brand reference (sync mobile `darkColors`). */
export const darkPalette = {
  neonLime: '#C7FE1D',
  paleYellow: '#F2F862',
  brightYellow: '#FFF30B',
  white: '#FEFEFE',
  lightGray: '#C1C1C1',
  charcoal: '#404040',
  black: '#000000',
} as const;

/** Derived dark mixes — sync mobile `darkMix` in paletteColors.ts */
export const darkMix = {
  canvasDeep: '#0A0A0A',
  canvasMid: '#121212',
  canvasSheen: '#1A1A1A',
  canvasShadow: '#070707',
  cardHover: '#4A4A4A',
  cardElevated: '#484848',
  sheet: 'rgba(64, 64, 64, 0.96)',
  charcoalWash6: 'rgba(64, 64, 64, 0.06)',
  charcoalWash10: 'rgba(64, 64, 64, 0.10)',
  charcoalWash18: 'rgba(64, 64, 64, 0.04)',
  charcoalWash32: 'rgba(64, 64, 64, 0.08)',
  limeGlow1: 'rgba(199, 254, 29, 0.01)',
  limeGlowEdge: 'rgba(199, 254, 29, 0.012)',
  limeGlow4: 'rgba(199, 254, 29, 0.008)',
  limeGlow7: 'rgba(199, 254, 29, 0.014)',
  limeGlow10: 'rgba(199, 254, 29, 0.02)',
  limeMuted12: 'rgba(199, 254, 29, 0.12)',
  limeMuted18: 'rgba(199, 254, 29, 0.18)',
  limeBorder32: 'rgba(199, 254, 29, 0.32)',
  whiteBorder6: 'rgba(254, 254, 254, 0.06)',
  whiteBorder8: 'rgba(254, 254, 254, 0.08)',
  whiteBorder10: 'rgba(254, 254, 254, 0.1)',
  textMuted: 'rgba(193, 193, 193, 0.72)',
  overlay: 'rgba(0, 0, 0, 0.88)',
  overlayLight: 'rgba(0, 0, 0, 0.68)',
  errorBg: 'rgba(248, 113, 113, 0.15)',
  errorBorder: '#F87171',
} as const;

/** Dark semantic colors — sync mobile `designSystem.ts` darkSemantic */
export const darkSemantic = {
  background: darkPalette.black,
  surface: darkMix.canvasDeep,
  card: darkPalette.charcoal,
  primary: darkPalette.neonLime,
  primaryLight: darkPalette.paleYellow,
  success: '#4ADE80',
  warning: darkPalette.brightYellow,
  error: '#F87171',
  errorBg: darkMix.errorBg,
  errorBorder: darkMix.errorBorder,
  textPrimary: darkPalette.white,
  textSecondary: darkPalette.lightGray,
  textMuted: darkMix.textMuted,
  border: darkMix.whiteBorder8,
  borderLight: darkMix.whiteBorder6,
} as const;

/** Semantic tokens for charts (resolved at runtime via CSS variables when possible). */
export const chartPalette = {
  primary: 'var(--vb-primary)',
  primaryLight: 'var(--vb-primary-light)',
  accent: 'var(--vb-accent)',
  accentSoft: 'var(--vb-accent-soft)',
  accentLight: 'var(--vb-accent-light)',
  text: 'var(--vb-text)',
  grid: 'var(--vb-border-light)',
  axis: 'var(--vb-text-secondary)',
  success: 'var(--vb-success)',
  warning: 'var(--vb-warning)',
  error: 'var(--vb-error)',
  draft: 'var(--vb-text-muted)',
} as const;
