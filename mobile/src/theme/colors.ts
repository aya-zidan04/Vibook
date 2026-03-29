/**
 * Vibook — five-color palette (earthy / terracotta / plum).
 *
 * | Token        | Hex       | Role |
 * |--------------|-----------|------|
 * | Terracotta   | `#B9724C` | Primary, accents, CTAs |
 * | Burnt sienna | `#A35A40` | Primary dark, emphasis |
 * | Cream        | `#F7EFE7` | Primary text on dark UI |
 * | Deep plum    | `#5B3B4B` | App background base |
 * | Beige        | `#D7C2A8` | Secondary text, borders, sand surfaces |
 */

/** Matches `colors.background` — use for `fadePlum()` image overlays */
const BG_RGB = { r: 91, g: 59, b: 75 } as const;

export const colors = {
  // Palette (canonical)
  terracotta: '#B9724C',
  burntSienna: '#A35A40',
  cream: '#F7EFE7',
  plum: '#5B3B4B',
  beige: '#D7C2A8',

  primary: '#B9724C',
  primaryLight: '#C98B6E',
  primaryMuted: 'rgba(185, 114, 76, 0.22)',
  primaryDark: '#A35A40',

  accent: '#C98B6E',
  accentDeep: '#4A3345',
  accentMuted: 'rgba(185, 114, 76, 0.2)',

  secondary: '#D7C2A8',
  secondaryMuted: 'rgba(215, 194, 168, 0.22)',

  background: '#5B3B4B',
  backgroundElevated: '#634A59',

  surface: '#6B5562',
  surfaceHover: '#75606E',
  surfaceMuted: '#7E6C78',

  border: '#8E7A72',
  borderLight: '#A89288',

  text: '#F7EFE7',
  textSecondary: '#D7C2A8',
  textMuted: '#B5A89A',

  overlay: 'rgba(45, 30, 40, 0.65)',
  overlayLight: 'rgba(45, 30, 40, 0.38)',

  success: '#B9724C',
  warning: '#C98B6E',
  error: '#A35A40',
  favorite: '#B9724C',

  glowPrimary: 'rgba(185, 114, 76, 0.42)',
  glowAccent: 'rgba(215, 194, 168, 0.32)',
} as const;

export type ColorKey = keyof typeof colors;

/** `rgba(r,g,b,a)` using the app background plum — for gradients over photos */
export function fadePlum(alpha: number): string {
  const { r, g, b } = BG_RGB;
  return `rgba(${r},${g},${b},${alpha})`;
}
