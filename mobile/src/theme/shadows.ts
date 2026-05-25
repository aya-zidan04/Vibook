import { Platform, ViewStyle } from 'react-native';
import { darkTheme, lightTheme, themeForMode, type ThemeShadowTokens } from './designSystem';
import { darkPalette, type ThemeColors } from './palettes';
import type { ColorScheme } from '@/store/themeStore';

function tokenToViewStyle(t: ThemeShadowTokens['sm']): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: t.color,
      shadowOffset: { width: 0, height: t.offsetY },
      shadowOpacity: t.opacity,
      shadowRadius: t.radius,
    },
    android: { elevation: t.elevation },
    default: { elevation: t.elevation },
  }) ?? { elevation: t.elevation };
}

export function createShadows(colors: ThemeColors) {
  const isLight = colors.bgRgb.r > 200;
  const tokens = isLight ? lightTheme.shadows : darkTheme.shadows;

  return {
    sm: tokenToViewStyle(tokens.sm),
    md: tokenToViewStyle(tokens.md),
    lg: tokenToViewStyle(tokens.lg),
    glow: tokenToViewStyle(tokens.glow),
    tabBar: {
      ...tokenToViewStyle(tokens.sm),
      borderTopWidth: Platform.OS === 'ios' ? 0.5 : 0,
      borderTopColor: colors.border,
    },
  } as const;
}

/** Default shadows (dark) for non-hook contexts. */
export const shadows = createShadows(darkPalette);

export function shadowTokensFor(scheme: ColorScheme): ThemeShadowTokens {
  return themeForMode(scheme).shadows;
}
