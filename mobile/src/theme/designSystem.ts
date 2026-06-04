/**
 * Vibook design system — semantic tokens built from {@link paletteColors}.
 * Green/yellow brand · light warm cream canvas · dark cinematic night canvas.
 */

import { radii, spacing } from './spacing';
import { typography } from './typography';
import { darkColors as darkSw, darkMix, darkButtonGradient, lightColors as lightSw } from './paletteColors';

/** @deprecated Legacy alias — prefer `lightSw` / `darkSw` from `./paletteColors`. */
export const brand = {
  navy: lightSw.black,
  navyDeep: darkSw.black,
  plum: darkSw.charcoal,
  terracotta: lightSw.grassGreen,
  cyan: lightSw.limeGreen,
  blue: lightSw.limeGreen,
  pink: lightSw.neonYellow,
  pinkSoft: darkSw.neonLime,
  pinkLight: lightSw.softMint,
  pinkBg: lightSw.pastelSage,
  pinkBorder: lightSw.mintOffWhite,
  pinkText: lightSw.neonYellow,
  lightGray: lightSw.paleBone,
  lightText: darkSw.white,
  white: darkSw.white,
  lightSurface: lightSw.softMint,
  creamTint: 'rgba(232, 226, 215, 0.55)',
  meshBase: lightSw.creamCanvas,
  ambientLight: {
    base: lightSw.creamCanvas,
    vertical: [lightSw.creamCanvas, lightSw.creamCanvasAlt, lightSw.creamCard] as const,
    locations: [0, 0.45, 1] as const,
  },
  ambientDark: {
    base: darkSw.black,
    vertical: [darkSw.black, darkMix.charcoalWash6, darkSw.black] as const,
    locations: [0, 0.5, 1] as const,
  },
  skyBlue: lightSw.grassGreen,
  darkBackground: darkSw.black,
  darkSurface: darkSw.charcoal,
  darkElevated: darkMix.cardElevated,
  darkSheet: darkMix.sheet,
  darkBorderCyan: darkMix.limeBorder32,
  darkBorderPink: darkMix.whiteBorder8,
  darkBorderCream: darkMix.whiteBorder6,
  darkSection: darkMix.charcoalWash6,
} as const;

/** Mode accent highlight — dark mode uses brand lime sparingly. */
export function paletteAccentPink(mode: 'light' | 'dark'): string {
  return mode === 'light' ? lightSw.neonYellow : darkSw.neonLime;
}

export function paletteAccent(mode: 'light' | 'dark'): string {
  return paletteAccentPink(mode);
}

export type SemanticColors = {
  background: string;
  surface: string;
  card: string;
  primary: string;
  primaryLight: string;
  accent: string;
  accentSoft: string;
  accentLight: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  icon: string;
  disabled: string;
  placeholder: string;
  emptyStateIcon: string;
  chevron: string;
  rowDescription: string;
  iconContainerBg: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  tabInactive: string;
};

export type ThemeGradients = {
  primary: readonly [string, string];
  pinkGradient: readonly [string, string];
  hero: readonly [string, string, ...string[]];
  button: readonly [string, string];
  cardOverlay: readonly [string, string];
};

export type ButtonVariantStyle = {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  pressedOpacity: number;
  useGradient?: boolean;
};

export type ThemeButtons = {
  primary: ButtonVariantStyle;
  secondary: ButtonVariantStyle;
  ghost: ButtonVariantStyle;
  accent: ButtonVariantStyle;
  destructive: ButtonVariantStyle;
};

export type ThemeShadowTokens = {
  sm: { color: string; opacity: number; radius: number; offsetY: number; elevation: number };
  md: { color: string; opacity: number; radius: number; offsetY: number; elevation: number };
  lg: { color: string; opacity: number; radius: number; offsetY: number; elevation: number };
  glow: { color: string; opacity: number; radius: number; offsetY: number; elevation: number };
  glowAccent: { color: string; opacity: number; radius: number; offsetY: number; elevation: number };
};

export type AppTheme = {
  mode: 'light' | 'dark';
  colors: SemanticColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: ThemeShadowTokens;
  gradients: ThemeGradients;
  buttons: ThemeButtons;
};

const lightSemantic: SemanticColors = {
  background: lightSw.creamCanvas,
  surface: lightSw.creamCard,
  card: lightSw.creamCard,
  primary: lightSw.limeGreen,
  primaryLight: lightSw.grassGreen,
  accent: lightSw.neonYellow,
  accentSoft: lightSw.grassGreen,
  accentLight: lightSw.creamSection,
  accentBg: 'rgba(139, 194, 73, 0.12)',
  accentBorder: lightSw.creamBorder,
  accentText: lightSw.textPrimary,
  textPrimary: lightSw.textPrimary,
  textSecondary: lightSw.textSecondary,
  textMuted: lightSw.textMuted,
  icon: lightSw.icon,
  disabled: lightSw.disabled,
  placeholder: lightSw.placeholder,
  emptyStateIcon: lightSw.emptyStateIcon,
  chevron: lightSw.chevron,
  rowDescription: lightSw.rowDescription,
  iconContainerBg: lightSw.iconContainerBg,
  border: lightSw.creamBorder,
  borderLight: lightSw.pastelSage,
  success: '#2E7D32',
  warning: '#B45309',
  error: '#D92D20',
  errorBg: '#FFF1F0',
  errorBorder: '#F3B3AE',
  tabInactive: lightSw.tabInactive,
};

const darkSemantic: SemanticColors = {
  background: darkSw.black,
  surface: darkMix.canvasDeep,
  card: darkSw.charcoal,
  primary: darkSw.neonLime,
  primaryLight: darkSw.paleYellow,
  accent: darkSw.neonLime,
  accentSoft: darkSw.paleYellow,
  accentLight: darkMix.cardElevated,
  accentBg: darkMix.limeMuted12,
  accentBorder: darkMix.limeBorder32,
  accentText: darkSw.white,
  textPrimary: darkSw.white,
  textSecondary: darkSw.lightGray,
  textMuted: darkMix.textMuted,
  icon: darkSw.lightGray,
  disabled: darkMix.textMuted,
  placeholder: darkMix.textMuted,
  emptyStateIcon: darkSw.lightGray,
  chevron: darkMix.textMuted,
  rowDescription: darkMix.textMuted,
  iconContainerBg: darkMix.limeMuted18,
  border: darkMix.whiteBorder8,
  borderLight: darkMix.whiteBorder6,
  success: '#4ADE80',
  warning: darkSw.brightYellow,
  error: '#F87171',
  errorBg: 'rgba(248, 113, 113, 0.15)',
  errorBorder: '#F87171',
  tabInactive: darkMix.textMuted,
};

const lightShadows: ThemeShadowTokens = {
  sm: { color: lightSw.black, opacity: 0.06, radius: 8, offsetY: 2, elevation: 2 },
  md: { color: lightSw.black, opacity: 0.1, radius: 16, offsetY: 6, elevation: 4 },
  lg: { color: lightSw.black, opacity: 0.14, radius: 24, offsetY: 12, elevation: 8 },
  glow: { color: lightSw.limeGreen, opacity: 0.16, radius: 20, offsetY: 0, elevation: 6 },
  glowAccent: { color: lightSw.neonYellow, opacity: 0.14, radius: 18, offsetY: 0, elevation: 5 },
};

const darkShadows: ThemeShadowTokens = {
  sm: { color: darkSw.black, opacity: 0.6, radius: 14, offsetY: 6, elevation: 4 },
  md: { color: darkSw.black, opacity: 0.7, radius: 22, offsetY: 10, elevation: 7 },
  lg: { color: darkSw.black, opacity: 0.78, radius: 34, offsetY: 16, elevation: 12 },
  glow: { color: darkSw.neonLime, opacity: 0.024, radius: 20, offsetY: 0, elevation: 6 },
  glowAccent: { color: darkSw.neonLime, opacity: 0.016, radius: 16, offsetY: 0, elevation: 5 },
};

const lightGradients: ThemeGradients = {
  primary: [lightSw.limeGreen, lightSw.grassGreen],
  pinkGradient: [lightSw.neonYellow, lightSw.limeGreen],
  hero: [lightSw.creamCanvas, lightSw.creamCanvasAlt, lightSw.creamCard],
  button: [lightSw.grassGreen, lightSw.limeGreen],
  cardOverlay: ['transparent', 'rgba(0, 0, 0, 0.72)'],
};

const darkGradients: ThemeGradients = {
  primary: darkButtonGradient(),
  pinkGradient: darkButtonGradient(),
  hero: [darkSw.black, darkMix.canvasDeep, darkSw.charcoal],
  button: darkButtonGradient(),
  cardOverlay: ['transparent', darkMix.overlay],
};

function buildButtons(c: SemanticColors, mode: 'light' | 'dark'): ThemeButtons {
  const onPrimary = mode === 'light' ? lightSw.textPrimary : darkSw.black;
  const isDark = mode === 'dark';
  return {
    primary: {
      backgroundColor: c.primary,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: onPrimary,
      pressedOpacity: 0.9,
      useGradient: true,
    },
    secondary: {
      backgroundColor: isDark ? c.card : c.card,
      borderColor: isDark ? c.border : c.primary,
      borderWidth: 1.5,
      textColor: isDark ? c.textPrimary : c.primary,
      pressedOpacity: 0.92,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: c.textSecondary,
      pressedOpacity: 0.88,
    },
    accent: {
      backgroundColor: c.accent,
      borderColor: c.accentBorder,
      borderWidth: 1,
      textColor: onPrimary,
      pressedOpacity: 0.9,
    },
    destructive: {
      backgroundColor: mode === 'light' ? c.errorBg : 'rgba(248, 113, 113, 0.15)',
      borderColor: c.errorBorder,
      borderWidth: 1,
      textColor: c.error,
      pressedOpacity: 0.9,
    },
  };
}

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightSemantic,
  spacing,
  radii,
  typography,
  shadows: lightShadows,
  gradients: lightGradients,
  buttons: buildButtons(lightSemantic, 'light'),
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkSemantic,
  spacing,
  radii,
  typography,
  shadows: darkShadows,
  gradients: darkGradients,
  buttons: buildButtons(darkSemantic, 'dark'),
};

export function themeForMode(mode: 'light' | 'dark'): AppTheme {
  return mode === 'light' ? lightTheme : darkTheme;
}

export const colorUsageGuide = {
  explore: {
    background: 'Screen canvas',
    card: 'Event feed cards',
    primary: 'CTAs, main category chips, search icon',
    accent: 'Subcategory chips, promo badges, featured eyebrow',
    accentBg: 'Badge backgrounds, empty-state decor',
  },
  favorites: {
    accent: 'Active heart icon',
    accentBg: 'Heart button background when saved',
  },
  booking: {
    surface: 'Summary panels',
    primary: 'Confirm / pay buttons only',
  },
  businessDashboard: {
    primary: 'Create event CTA',
    accent: 'Activity icons, chart accents',
  },
  admin: {
    primary: 'Links, focus, primary buttons',
    accent: 'Notification badge, secondary chart series, highlight cards',
  },
  visualEffects: {
    headerSeparation: 'HeaderSeparationChrome — nav layer shadow/fade (see visualEffects.ts)',
    heroAmbient: 'HeroAmbientOverlay — hero/profile card diagonal wash',
    meProfileCard: 'Me tab profile card light-mode border/shadow tuning',
  },
} as const;

export { lightColors as lightPaletteSwatches, darkColors as darkPaletteSwatches } from './paletteColors';
