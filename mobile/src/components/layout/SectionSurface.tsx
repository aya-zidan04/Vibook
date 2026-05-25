import { ReactNode, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { createShadows, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  /** Slightly stronger panel for grouped lists (Me menu, booking blocks). */
  elevated?: boolean;
};

/** Groups content on the ambient canvas with a subtle elevated band. */
export function SectionSurface({ children, style, elevated = false }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors, elevated), [colors, elevated]);

  return <View style={[styles.root, style]}>{children}</View>;
}

function createStyles(colors: ThemeColors, elevated: boolean) {
  const shadows = createShadows(colors);
  return StyleSheet.create({
    root: {
      backgroundColor: elevated ? colors.card : colors.sectionSurface,
      borderRadius: radii.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: elevated ? colors.border : colors.borderCream,
      padding: spacing.lg,
      overflow: 'hidden',
      ...(elevated ? shadows.md : shadows.sm),
    },
  });
}
