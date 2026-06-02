/**
 * Admin theme palette — edit light/dark swatches here; CSS in `palette-colors.css` mirrors these values.
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

/** Dark mode — 7 swatches from brand reference. */
export const darkPalette = {
  neonLime: '#C7FE1D',
  paleYellow: '#F2F862',
  brightYellow: '#FFF30B',
  white: '#FEFEFE',
  lightGray: '#C1C1C1',
  charcoal: '#404040',
  black: '#000000',
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
