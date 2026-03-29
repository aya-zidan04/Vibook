import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

const ios = (
  opacity: number,
  radius: number,
  y: number,
  elevation: number,
  color?: string,
): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: color ?? colors.text,
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: { elevation },
  }) ?? { elevation };

export const shadows = {
  sm: ios(0.12, 10, 4, 3),
  md: ios(0.18, 16, 8, 6, colors.glowPrimary),
  lg: ios(0.22, 24, 12, 10),
  glow: {
    ...ios(0.35, 20, 0, 8, colors.primary),
  },
  tabBar: {
    ...ios(0.25, 12, -4, 12),
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderTopColor: colors.border,
  },
} as const;
