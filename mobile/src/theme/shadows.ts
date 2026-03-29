import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

const ios = (
  opacity: number,
  radius: number,
  offsetY: number,
  elevation: number,
): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {
      elevation,
    },
  }) ?? { elevation };

export const shadows = {
  /** Cards, search bar */
  sm: ios(0.06, 12, 4, 2),
  /** Featured / elevated cards */
  md: ios(0.08, 16, 8, 4),
  /** Modals, sticky footers */
  lg: ios(0.1, 20, 12, 8),
  /** Tab bar separation */
  tabBar: {
    ...ios(0.06, 10, -4, 6),
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderTopColor: colors.borderLight,
  },
} as const;
