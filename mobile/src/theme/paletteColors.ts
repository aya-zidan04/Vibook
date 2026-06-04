/**
 * Raw palette swatches — edit colors here only.
 * Light and dark palettes must not be mixed; semantic tokens in `designSystem.ts` map these per mode.
 */

/** Light mode palette — brand greens + warm cream surfaces (no green-tinted canvas). */
export const lightColors = {
  neonYellow: '#F0FB45',
  limeGreen: '#A7DC2B',
  grassGreen: '#8BC249',
  /** App canvas — soft cream / warm beige */
  creamCanvas: '#F7F4EC',
  creamCanvasAlt: '#F5F1E8',
  creamCard: '#FCFBF8',
  creamHeader: '#E8E2D7',
  creamBorder: '#E4DDD2',
  creamSection: '#F5F1E8',
  /** @deprecated Surface aliases — map to cream tokens */
  mintOffWhite: '#FCFBF8',
  paleBone: '#F7F4EC',
  softMint: '#F5F1E8',
  pastelSage: '#F0EDE6',
  sageBorder: '#E4DDD2',
  white: '#FCFBF8',
  black: '#000000',
  /** Light-mode typography & chrome — olive/sage, not gray. */
  textPrimary: '#1F2A1A',
  textSecondary: '#4D5A44',
  textMuted: '#5F6D55',
  icon: '#4A5841',
  tabInactive: '#5B6851',
  emptyStateIcon: '#55644A',
  chevron: '#55644A',
  rowDescription: '#55644A',
  iconContainerBg: 'rgba(139, 194, 73, 0.12)',
  disabled: '#7A8770',
  placeholder: '#5F6D55',
} as const;

/**
 * Dark mode palette (7 swatches, left → right) — brand reference image.
 * neonLime · paleYellow · brightYellow · white · lightGray · charcoal · black
 */
export const darkColors = {
  neonLime: '#C7FE1D',
  paleYellow: '#F2F862',
  brightYellow: '#FFF30B',
  white: '#FEFEFE',
  lightGray: '#C1C1C1',
  charcoal: '#404040',
  black: '#000000',
} as const;

/**
 * Derived dark mixes — built only from {@link darkColors}.
 * Used for gradients, borders, glows (never full-page light gray backgrounds).
 */
export const darkMix = {
  canvasDeep: '#0A0A0A',
  canvasMid: '#121212',
  /** Subtle charcoal sheen — top-right / bottom-left corners in page gradient. */
  canvasSheen: '#1A1A1A',
  /** Darkest diagonal shadow band. */
  canvasShadow: '#070707',
  cardHover: '#4A4A4A',
  cardElevated: '#484848',
  sheet: 'rgba(64, 64, 64, 0.96)',
  charcoalWash6: 'rgba(64, 64, 64, 0.06)',
  charcoalWash10: 'rgba(64, 64, 64, 0.10)',
  charcoalWash18: 'rgba(64, 64, 64, 0.04)',
  charcoalWash32: 'rgba(64, 64, 64, 0.08)',
  /** Page canvas only — edge whisper (~80% softer than prior glow stops). */
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
} as const;

/**
 * @deprecated Use {@link ./appBackground.ts} / {@link ./darkCanvas.ts}.
 */
export function darkBackgroundGradient(): readonly string[] {
  return ['#1A1A1A', '#0A0A0A'];
}

/** @deprecated Use {@link ./appBackground.ts}. */
export function darkBackgroundGradientLocations(): readonly number[] {
  return [0, 1];
}

/** @deprecated Use {@link pageBackgroundGradientVector} in darkCanvas.ts */
export function darkBackgroundGradientStart(): { readonly x: number; readonly y: number } {
  return { x: 0.21, y: 0.09 };
}

/** @deprecated Use {@link pageBackgroundGradientVector} in darkCanvas.ts */
export function darkBackgroundGradientEnd(): { readonly x: number; readonly y: number } {
  return { x: 0.79, y: 0.91 };
}

/** Primary CTA gradient — neon lime into pale yellow (palette swatches 1 → 2). */
export function darkButtonGradient(): readonly [string, string] {
  return [darkColors.neonLime, darkColors.paleYellow];
}

export type LightPalette = typeof lightColors;
export type DarkPalette = typeof darkColors;
