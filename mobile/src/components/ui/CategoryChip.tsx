import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useThemeStore } from '@/store/themeStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  /** `primary` = catalog categories. `accent` = quick filters. */
  variant?: 'primary' | 'accent';
  onPress?: () => void;
};

export function CategoryChip({ label, icon, selected, variant = 'primary', onPress }: Props) {
  const colors = useThemeColors();
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isAccent = variant === 'accent';

  const selectedStyle = selected
    ? isLight
      ? {
          backgroundColor: colors.card,
          borderColor: colors.primaryLight,
          borderWidth: 1.5,
        }
      : {
          backgroundColor: isAccent ? colors.accentBg : colors.primary,
          borderColor: isAccent ? colors.accentBorder : colors.primary,
        }
    : null;

  const labelColor = selected
    ? isLight
      ? 'text'
      : isAccent
        ? 'accentText'
        : 'textOnPrimary'
    : isLight
      ? 'rowDescription'
      : 'textSecondary';

  const iconColor = selected
    ? isLight
      ? colors.primaryLight
      : isAccent
        ? colors.accentText
        : colors.textOnPrimary
    : colors.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selectedStyle,
        pressed && { opacity: 0.88 },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={16} color={iconColor} />
      ) : null}
      <AppText variant="label" color={labelColor}>
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginEnd: spacing.sm,
    },
  });
}
