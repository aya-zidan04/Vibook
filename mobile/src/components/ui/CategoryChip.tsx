import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  /** `primary` = blue (catalog). `accent` = pink (quick filters / secondary). */
  variant?: 'primary' | 'accent';
  onPress?: () => void;
};

export function CategoryChip({ label, icon, selected, variant = 'primary', onPress }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isAccent = variant === 'accent';

  const selectedBg = isAccent ? colors.accentBg : colors.primary;
  const selectedBorder = isAccent ? colors.accentBorder : colors.primary;
  const selectedFg = isAccent ? 'accentText' : 'textOnPrimary';
  const selectedIcon = isAccent ? colors.accentText : colors.textOnPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && {
          backgroundColor: selectedBg,
          borderColor: selectedBorder,
        },
        pressed && { opacity: 0.88 },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? selectedIcon : colors.textMuted}
        />
      ) : null}
      <AppText
        variant="label"
        color={selected ? selectedFg : 'textSecondary'}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginEnd: spacing.sm,
    },
  });
}
