/**
 * Vibook design system — premium booking platform tokens.
 * Blue = primary CTAs · Pink = emotional accent (favorites, badges, highlights).
 */

import { radii, spacing } from './spacing';
import { typography } from './typography';

/**
 * Brand palette.
 * Cyan primary CTAs · pink emotional accent · pink-wash ambient canvas.
 */
export const brand = {
  navy: '#111827',
  navyDeep: '#08111F',
  plum: '#5B3B4B',
  terracotta: '#C4896C',
  cyan: '#16C6FF',
  blue: '#00C2FF',
  pink: '#FF4D8D',
  pinkSoft: '#FF6FAE',
  pinkLight: '#FFE3EE',
  pinkBg: '#FFF0F6',
  pinkBorder: '#FFB3CF',
  /** @deprecated Use `paletteAccentPink(mode)` — light `#FF4D8D`, dark `#FF70A6`. */
  pinkText: '#FF4D8D',
  lightGray: '#FFF7FB',
  lightText: '#F9FAFB',
  white: '#FFFFFF',
  lightSurface: '#FFFFFF',
  creamTint: 'rgba(247, 239, 231, 0.05)',
  /** Screen canvas (light). */
  meshBase: '#F4F7FB',
  /** @deprecated Use `ambientPresetFor` from `./ambient`. */
  ambientLight: {
    base: '#F4F7FB',
    vertical: ['#FFFFFF', '#FFF0F6', '#F4F7FB'] as const,
    locations: [0, 0.45, 1] as const,
  },
  /** @deprecated Use `ambientPresetFor` from `./ambient`. */
  ambientDark: {
    base: '#08111F',
    vertical: ['#08111F', '#111827', '#152238'] as const,
    locations: [0, 0.5, 1] as const,
  },
  skyBlue: '#33D6FF',
  darkBackground: '#08111F',
  darkSurface: '#162238',
  darkElevated: '#1E2F48',
  darkSheet: '#131D2E',
  darkBorderCyan: 'rgba(22, 198, 255, 0.28)',
  darkBorderPink: 'rgba(255, 111, 174, 0.24)',
  darkBorderCream: 'rgba(247, 239, 231, 0.1)',
  darkSection: 'rgba(247, 239, 231, 0.05)',
} as const;

/** Coolors pink — `#FF4D8D` light · `#FF6FAE` dark. */
export function paletteAccentPink(mode: 'light' | 'dark'): string {
  return mode === 'light' ? brand.pink : brand.pinkSoft;
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
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
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

const lightColors: SemanticColors = {
  background: brand.lightGray,
  surface: 'rgba(255, 255, 255, 0.92)',
  card: 'rgba(255, 255, 255, 0.96)',
  primary: brand.cyan,
  primaryLight: brand.skyBlue,
  accent: paletteAccentPink('light'),
  accentSoft: '#FF8AB8',
  accentLight: brand.pinkLight,
  accentBg: 'rgba(255, 77, 141, 0.1)',
  accentBorder: 'rgba(255, 77, 141, 0.32)',
  accentText: paletteAccentPink('light'),
  textPrimary: brand.navy,
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  border: 'rgba(22, 198, 255, 0.2)',
  borderLight: 'rgba(255, 111, 174, 0.18)',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
};

const darkColors: SemanticColors = {
  background: brand.darkBackground,
  surface: brand.darkSurface,
  card: brand.darkElevated,
  primary: brand.cyan,
  primaryLight: brand.skyBlue,
  accent: paletteAccentPink('dark'),
  accentSoft: '#FF9BC1',
  accentLight: '#FFD1E3',
  accentBg: 'rgba(255, 111, 174, 0.14)',
  accentBorder: 'rgba(255, 111, 174, 0.4)',
  accentText: paletteAccentPink('dark'),
  textPrimary: brand.lightText,
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: brand.darkBorderCyan,
  borderLight: brand.darkBorderPink,
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
};

const lightShadows: ThemeShadowTokens = {
  sm: { color: brand.navy, opacity: 0.06, radius: 8, offsetY: 2, elevation: 2 },
  md: { color: brand.navy, opacity: 0.1, radius: 16, offsetY: 6, elevation: 4 },
  lg: { color: brand.navy, opacity: 0.14, radius: 24, offsetY: 12, elevation: 8 },
  glow: { color: brand.blue, opacity: 0.28, radius: 20, offsetY: 0, elevation: 6 },
  glowAccent: { color: brand.pink, opacity: 0.32, radius: 18, offsetY: 0, elevation: 5 },
};

const darkShadows: ThemeShadowTokens = {
  sm: { color: '#000000', opacity: 0.42, radius: 12, offsetY: 5, elevation: 4 },
  md: { color: brand.cyan, opacity: 0.2, radius: 20, offsetY: 10, elevation: 7 },
  lg: { color: '#000000', opacity: 0.52, radius: 32, offsetY: 16, elevation: 12 },
  glow: { color: brand.cyan, opacity: 0.38, radius: 24, offsetY: 0, elevation: 8 },
  glowAccent: { color: brand.pinkSoft, opacity: 0.45, radius: 20, offsetY: 0, elevation: 7 },
};

const lightGradients: ThemeGradients = {
  primary: [brand.cyan, brand.skyBlue],
  pinkGradient: [paletteAccentPink('light'), '#FF8AB8'],
  hero: [brand.white, brand.pinkBg, brand.lightGray],
  button: [brand.cyan, brand.skyBlue],
  cardOverlay: ['transparent', 'rgba(17, 24, 39, 0.82)'],
};

const darkGradients: ThemeGradients = {
  primary: [brand.cyan, brand.skyBlue],
  pinkGradient: [paletteAccentPink('dark'), '#FF9BC1'],
  hero: [brand.navyDeep, brand.plum, brand.darkSurface],
  button: ['#0EA5D4', brand.cyan],
  cardOverlay: ['transparent', 'rgba(8, 17, 31, 0.9)'],
};

function buildButtons(c: SemanticColors, mode: 'light' | 'dark'): ThemeButtons {
  const onPrimary = brand.white;
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
      backgroundColor: mode === 'light' ? c.card : c.surface,
      borderColor: c.primary,
      borderWidth: 1.5,
      textColor: c.primary,
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
      backgroundColor: mode === 'light' ? '#FEE2E2' : 'rgba(248, 113, 113, 0.15)',
      borderColor: c.error,
      borderWidth: 1,
      textColor: c.error,
      pressedOpacity: 0.9,
    },
  };
}

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  radii,
  typography,
  shadows: lightShadows,
  gradients: lightGradients,
  buttons: buildButtons(lightColors, 'light'),
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  radii,
  typography,
  shadows: darkShadows,
  gradients: darkGradients,
  buttons: buildButtons(darkColors, 'dark'),
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
} as const;
