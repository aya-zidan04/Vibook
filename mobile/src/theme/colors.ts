/**
 * @deprecated For runtime UI use `useThemeColors()` from `@/theme` or `@/store/themeStore`.
 * `colors` remains an alias to the dark palette for rare non-React contexts only.
 */
import { darkPalette, type ThemeColors } from './palettes';

export type ColorKey = keyof ThemeColors;

export const colors = darkPalette;

/** @deprecated Pass `useThemeColors()` — signature is `fadeFromBackground(colors, alpha)`. */
export function fadePlum(alpha: number): string {
  const { r, g, b } = darkPalette.bgRgb;
  return `rgba(${r},${g},${b},${alpha})`;
}
