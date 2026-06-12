/**
 * Approved visual-effect constants (header separation, hero ambient, card shadows).
 *
 * Semantic palette swatches: {@link ./paletteColors.ts} and {@link ./designSystem.ts}.
 * Components should import from here — do not scatter duplicate rgba/shadow literals.
 */

import { lightColors as lightSw } from './paletteColors';

/** Light nav header — warm gray-beige slab above cream canvas. */
export const headerChromeLight = {
  fill: lightSw.creamHeader,
  divider: 'rgba(0, 0, 0, 0.06)',
  shadowColor: '#000000',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 } as const,
  androidElevation: 3,
  edgeFade: 'rgba(247, 244, 236, 0.6)',
} as const;

/** Frosted header chrome — light mode only, via {@link HeaderSeparationChrome}. */
export const headerGlassEffect = {
  blurIntensity: { light: 52, dark: 36 },
  fillOpacity: { light: 0.88, dark: 0.82 },
  borderColor: { light: 'rgba(0, 0, 0, 0.08)', dark: 'rgba(255, 255, 255, 0.08)' },
  shadow: headerChromeLight,
} as const;

/** Navigation header layer separation — used by {@link HeaderSeparationChrome}. */
export const headerSeparationEffect = {
  fadeHeight: 10,
  light: {
    shadowColor: headerChromeLight.shadowColor,
    shadowOpacity: headerChromeLight.shadowOpacity,
    shadowRadius: headerChromeLight.shadowRadius,
    shadowOffset: headerChromeLight.shadowOffset,
    androidElevation: headerChromeLight.androidElevation,
    fadeTop: headerChromeLight.edgeFade,
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
      'rgba(0, 0, 0, 0.03)',
      'transparent',
      'rgba(0, 0, 0, 0.02)',
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

/** Me tab profile header card — light-mode border + shadow tuning. */
export const meProfileCardLightEffect = {
  borderColor: lightSw.creamBorder,
  shadowOpacity: 0.22,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 } as const,
  androidElevation: 5,
} as const;
