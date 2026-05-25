import { ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createShadows, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  children: ReactNode;
};

export function StickyBottomBar({ children }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = useMemo(() => createBarStyles(colors), [colors]);
  const sh = useMemo(() => createShadows(colors), [colors]);

  return (
    <View
      style={[
        styles.bar,
        sh.lg,
        {
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
      ]}
    >
      {children}
    </View>
  );
}

function createBarStyles(colors: ThemeColors) {
  return StyleSheet.create({
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.sheetSurface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: spacing.screen,
      paddingTop: spacing.md,
    },
  });
}
