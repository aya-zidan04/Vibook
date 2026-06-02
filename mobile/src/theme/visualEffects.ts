/**
 * Approved visual-effect constants (header separation, hero ambient, card shadows).
 *
 * Semantic palette swatches: {@link ./paletteColors.ts} and {@link ./designSystem.ts}.
 * Components should import from here — do not scatter duplicate rgba/shadow literals.
 */

/** Navigation header layer separation — used by {@link HeaderSeparationChrome}. */
export const headerSeparationEffect = {
  fadeHeight: 14,
  light: {
    shadowColor: '#55644A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 } as const,
    androidElevation: 3,
    fadeTop: 'rgba(85, 100, 74, 0.05)',
  },
  dark: {
    shadowColor: '#A6CD57',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 } as const,
    androidElevation: 2,
    fadeTop: 'rgba(166, 205, 87, 0.06)',
  },
} as const;

/** Diagonal ambient wash on hero/profile cards — used by {@link HeroAmbientOverlay}. */
export const heroAmbientEffect = {
  locations: [0, 0.5, 1] as const,
  gradientStart: { x: 0, y: 0 } as const,
  gradientEnd: { x: 1, y: 1 } as const,
  light: {
    colors: [
      'rgba(167, 220, 43, 0.08)',
      'transparent',
      'rgba(139, 194, 73, 0.06)',
    ] as const,
  },
  dark: {
    colors: [
      'rgba(167, 220, 43, 0.07)',
      'transparent',
      'rgba(139, 194, 73, 0.045)',
    ] as const,
  },
} as const;

/** Me tab profile header card — light-mode border + shadow tuning (base fill uses `sageBorder`). */
export const meProfileCardLightEffect = {
  borderColor: '#B7C8A3',
  shadowOpacity: 0.22,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 } as const,
  androidElevation: 5,
} as const;
