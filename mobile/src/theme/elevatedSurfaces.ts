import { StyleSheet } from 'react-native';
import { createShadows } from './shadows';
import { radii } from './spacing';
import type { ThemeColors } from './palettes';

/** Standard elevated card on the ambient canvas. */
export function elevatedCardStyle(colors: ThemeColors, radius: number = radii.xl) {
  const shadows = createShadows(colors);
  const isLight = colors.bgRgb.r > 200;
  return {
    backgroundColor: colors.card,
    borderRadius: radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...(isLight ? shadows.sm : shadows.md),
  } as const;
}
