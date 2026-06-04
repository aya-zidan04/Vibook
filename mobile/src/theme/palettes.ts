/**
 * Runtime semantic palette for React Native components.
 * Built from {@link designSystem} — do not hardcode hex values in screens.
 */

import { brand, darkTheme, lightTheme, paletteAccent, type SemanticColors } from './designSystem';
import { appBackgroundBaseFor } from './appBackground';
import { darkColors as darkSw, darkMix, lightColors as lightSw } from './paletteColors';
import type { ColorScheme } from '@/store/themeStore';

export type ThemeColors = SemanticColors & {
  /** @deprecated Use `textPrimary` — kept for AppText `color="text"`. */
  text: string;
  backgroundElevated: string;
  surfaceHover: string;
  surfaceMuted: string;
  sectionSurface: string;
  sheetSurface: string;
  primaryMuted: string;
  primaryDark: string;
  accentDeep: string;
  /** @deprecated Prefer `accentBg`. */
  accentMuted: string;
  secondary: string;
  secondaryMuted: string;
  textOnPrimary: string;
  overlay: string;
  overlayLight: string;
  favorite: string;
  accentPink: string;
  glowPrimary: string;
  glowAccent: string;
  glowPlum: string;
  glowTerracotta: string;
  borderCream: string;
  bgRgb: { r: number; g: number; b: number };
  terracotta: string;
  burntSienna: string;
  cream: string;
  plum: string;
  beige: string;
  /** Semi-opaque chip on media (e.g. favorite button on event cards). */
  iconOverlay: string;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function semanticToThemeColors(c: SemanticColors, mode: ColorScheme): ThemeColors {
  const isLight = mode === 'light';
  const ambientBase = appBackgroundBaseFor(mode);
  return {
    ...c,
    text: c.textPrimary,
    backgroundElevated: isLight ? lightSw.creamCard : darkMix.cardElevated,
    surfaceHover: isLight ? lightSw.creamSection : darkMix.cardHover,
    surfaceMuted: isLight ? lightSw.creamSection : darkMix.canvasDeep,
    sectionSurface: isLight ? lightSw.creamSection : brand.darkSection,
    sheetSurface: isLight ? lightSw.creamCard : darkMix.sheet,
    primaryMuted: isLight ? 'rgba(74, 88, 65, 0.14)' : darkMix.limeMuted18,
    primaryDark: isLight ? lightSw.limeGreen : darkSw.paleYellow,
    accentDeep: isLight ? lightSw.textPrimary : darkSw.charcoal,
    accentMuted: c.accentBg,
    secondary: isLight ? lightSw.grassGreen : darkSw.lightGray,
    secondaryMuted: isLight ? 'rgba(139, 194, 73, 0.12)' : darkMix.charcoalWash18,
    textOnPrimary: darkSw.black,
    overlay: isLight ? 'rgba(0, 0, 0, 0.45)' : darkMix.overlay,
    overlayLight: isLight ? 'rgba(0, 0, 0, 0.25)' : darkMix.overlayLight,
    favorite: c.primary,
    accentPink: paletteAccent(mode),
    glowPrimary: isLight ? 'rgba(167, 220, 43, 0.12)' : darkMix.limeGlow10,
    glowAccent: isLight ? 'rgba(240, 251, 69, 0.1)' : darkMix.limeGlowEdge,
    glowPlum: isLight ? 'rgba(74, 88, 65, 0.12)' : darkMix.charcoalWash6,
    glowTerracotta: isLight ? 'rgba(139, 194, 73, 0.1)' : darkMix.limeGlow1,
    borderCream: isLight ? lightSw.sageBorder : brand.darkBorderCream,
    bgRgb: hexToRgb(ambientBase),
    terracotta: c.primary,
    burntSienna: c.error,
    cream: lightSw.creamCanvas,
    plum: isLight ? lightSw.grassGreen : darkSw.charcoal,
    beige: c.borderLight,
    iconOverlay: isLight ? 'rgba(74, 88, 65, 0.45)' : 'rgba(0, 0, 0, 0.45)',
  };
}

export const lightPalette: ThemeColors = semanticToThemeColors(lightTheme.colors, 'light');
export const darkPalette: ThemeColors = semanticToThemeColors(darkTheme.colors, 'dark');

/** Fade into the ambient canvas base (hero images, PDP headers). */
export function fadeFromBackground(colors: ThemeColors, alpha: number): string {
  const { r, g, b } = colors.bgRgb;
  return `rgba(${r},${g},${b},${alpha})`;
}
