import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { createShadows, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  placeholder?: string;
  onPress?: () => void;
};

export function SearchBar({
  placeholder = 'Search events, dining, stays…',
  onPress,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const sh = useMemo(() => createShadows(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, sh.sm, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      accessibilityLabel="Search"
    >
      <Ionicons name="search" size={22} color={colors.primary} />
      <AppText variant="body-em" color="textMuted" style={styles.ph}>
        {placeholder}
      </AppText>
      <Ionicons name="options-outline" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
    },
    ph: { flex: 1 },
  });
}
