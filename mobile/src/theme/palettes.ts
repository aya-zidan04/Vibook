/**
 * Semantic color tokens for dark (default) and light themes.
 * Keep keys in sync when adding new UI surfaces.
 */

export type ThemeColors = {
  terracotta: string;
  burntSienna: string;
  cream: string;
  plum: string;
  beige: string;
  primary: string;
  primaryLight: string;
  primaryMuted: string;
  primaryDark: string;
  accent: string;
  accentDeep: string;
  accentMuted: string;
  secondary: string;
  secondaryMuted: string;
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceHover: string;
  surfaceMuted: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  /** Text on primary CTA (always light for contrast). */
  textOnPrimary: string;
  overlay: string;
  overlayLight: string;
  success: string;
  warning: string;
  error: string;
  favorite: string;
  glowPrimary: string;
  glowAccent: string;
  /** RGB for image fade overlays matching `background`. */
  bgRgb: { r: number; g: number; b: number };
};

export const darkPalette: ThemeColors = {
  terracotta: '#B9724C',
  burntSienna: '#A35A40',
  cream: '#F7EFE7',
  plum: '#5B3B4B',
  beige: '#D7C2A8',
  primary: '#B9724C',
  primaryLight: '#C98B6E',
  primaryMuted: 'rgba(185, 114, 76, 0.28)',
  primaryDark: '#A35A40',
  accent: '#C98B6E',
  accentDeep: '#4A3345',
  accentMuted: 'rgba(185, 114, 76, 0.2)',
  secondary: '#D7C2A8',
  secondaryMuted: 'rgba(215, 194, 168, 0.22)',
  background: '#5B3B4B',
  backgroundElevated: '#685464',
  surface: '#766070',
  surfaceHover: '#816A7B',
  surfaceMuted: '#8A7485',
  border: '#958894',
  borderLight: '#A89796',
  text: '#F7EFE7',
  textSecondary: '#D7C2A8',
  textMuted: '#B5A89A',
  textOnPrimary: '#F7EFE7',
  overlay: 'rgba(45, 30, 40, 0.65)',
  overlayLight: 'rgba(45, 30, 40, 0.38)',
  success: '#B9724C',
  warning: '#C98B6E',
  error: '#A35A40',
  favorite: '#B9724C',
  glowPrimary: 'rgba(185, 114, 76, 0.42)',
  glowAccent: 'rgba(215, 194, 168, 0.32)',
  bgRgb: { r: 91, g: 59, b: 75 },
};

export const lightPalette: ThemeColors = {
  terracotta: '#B9724C',
  burntSienna: '#A35A40',
  cream: '#F7EFE7',
  plum: '#3D2A32',
  beige: '#8B735A',
  primary: '#B9724C',
  primaryLight: '#C98B6E',
  primaryMuted: 'rgba(185, 114, 76, 0.18)',
  primaryDark: '#9A5A3C',
  accent: '#A65D3A',
  accentDeep: '#5B3B4B',
  accentMuted: 'rgba(185, 114, 76, 0.14)',
  secondary: '#C4A990',
  secondaryMuted: 'rgba(196, 169, 144, 0.35)',
  background: '#F4EFEA',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceHover: '#EFE8E2',
  surfaceMuted: '#E8E0DA',
  border: '#DDD4CC',
  borderLight: '#EAE3DD',
  text: '#2A1F24',
  textSecondary: '#5C4D55',
  textMuted: '#8A7B82',
  textOnPrimary: '#F7EFE7',
  overlay: 'rgba(30, 22, 26, 0.45)',
  overlayLight: 'rgba(30, 22, 26, 0.2)',
  success: '#2E7D4A',
  warning: '#C17A3A',
  error: '#A35A40',
  favorite: '#B9724C',
  glowPrimary: 'rgba(185, 114, 76, 0.28)',
  glowAccent: 'rgba(196, 169, 144, 0.45)',
  bgRgb: { r: 244, g: 239, b: 234 },
};

export function fadeFromBackground(colors: ThemeColors, alpha: number): string {
  const { r, g, b } = colors.bgRgb;
  return `rgba(${r},${g},${b},${alpha})`;
}
