import { Platform, ViewStyle } from 'react-native';
import { darkPalette } from './palettes';
import type { ThemeColors } from './palettes';

const ios = (
  opacity: number,
  radius: number,
  y: number,
  elevation: number,
  color?: string,
): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: color ?? '#000000',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: { elevation },
  }) ?? { elevation };

export function createShadows(colors: ThemeColors) {
  const isLight = colors.bgRgb.r > 200;
  const cardShadow = isLight ? '#2A1F24' : colors.text;

  return {
    sm: ios(0.14, 10, 4, 3, cardShadow),
    md: ios(0.18, 16, 8, 6, colors.glowPrimary),
    lg: ios(0.22, 24, 12, 10, cardShadow),
    glow: {
      ...ios(0.35, 20, 0, 8, colors.primary),
    },
    tabBar: {
      ...ios(0.22, 12, -4, 12, cardShadow),
      borderTopWidth: Platform.OS === 'ios' ? 0.5 : 0,
      borderTopColor: colors.border,
    },
  } as const;
}

/** Default (dark) shadows for modules that cannot access hooks. Prefer `createShadows(useThemeColors())`. */
export const shadows = createShadows(darkPalette);
