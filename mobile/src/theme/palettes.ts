/**
 * Runtime semantic palette for React Native components.
 * Built from {@link designSystem} — do not hardcode hex values in screens.
 */

import { brand, darkTheme, lightTheme, paletteAccentPink, type SemanticColors } from './designSystem';
import { APP_BACKGROUND_BASE } from './appBackground';
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
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function semanticToThemeColors(c: SemanticColors, mode: ColorScheme): ThemeColors {
  const isLight = mode === 'light';
  const ambientBase = APP_BACKGROUND_BASE;
  return {
    ...c,
    text: c.textPrimary,
    backgroundElevated: isLight ? brand.white : c.card,
    surfaceHover: isLight ? '#F1F5F9' : '#243552',
    surfaceMuted: isLight ? '#EEF2F6' : '#101828',
    sectionSurface: isLight ? 'rgba(247, 239, 231, 0.55)' : brand.darkSection,
    sheetSurface: 'rgba(255, 255, 255, 0.92)',
    primaryMuted: isLight ? 'rgba(22, 198, 255, 0.12)' : 'rgba(22, 198, 255, 0.18)',
    primaryDark: '#0EA5D4',
    accentDeep: brand.navy,
    accentMuted: c.accentBg,
    secondary: brand.skyBlue,
    secondaryMuted: isLight ? 'rgba(22, 198, 255, 0.14)' : 'rgba(22, 198, 255, 0.12)',
    textOnPrimary: brand.white,
    overlay: isLight ? 'rgba(8, 17, 31, 0.5)' : 'rgba(8, 17, 31, 0.78)',
    overlayLight: isLight ? 'rgba(8, 17, 31, 0.28)' : 'rgba(8, 17, 31, 0.48)',
    favorite: c.accent,
    accentPink: paletteAccentPink(mode),
    glowPrimary: isLight ? 'rgba(22, 198, 255, 0.26)' : 'rgba(22, 198, 255, 0.34)',
    glowAccent: isLight ? 'rgba(255, 111, 174, 0.28)' : 'rgba(255, 111, 174, 0.38)',
    glowPlum: isLight ? 'rgba(91, 59, 75, 0.12)' : 'rgba(91, 59, 75, 0.22)',
    glowTerracotta: isLight ? 'rgba(196, 137, 108, 0.18)' : 'rgba(196, 137, 108, 0.22)',
    borderCream: isLight ? 'rgba(247, 239, 231, 0.9)' : brand.darkBorderCream,
    bgRgb: hexToRgb(ambientBase),
    terracotta: brand.terracotta,
    burntSienna: c.error,
    cream: '#F7EFE7',
    plum: brand.plum,
    beige: c.borderLight,
  };
}

export const lightPalette: ThemeColors = semanticToThemeColors(lightTheme.colors, 'light');
export const darkPalette: ThemeColors = semanticToThemeColors(darkTheme.colors, 'dark');

/** Fade into the ambient canvas base (hero images, PDP headers). */
export function fadeFromBackground(colors: ThemeColors, alpha: number): string {
  const { r, g, b } = colors.bgRgb;
  return `rgba(${r},${g},${b},${alpha})`;
}
