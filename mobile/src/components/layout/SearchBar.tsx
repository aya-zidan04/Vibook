import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, shadows, spacing } from '@/theme';

type Props = {
  placeholder?: string;
  onPress?: () => void;
};

export function SearchBar({
  placeholder = 'Search events, dining, stays, flights…',
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, shadows.sm, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      accessibilityLabel="Search"
    >
      <Ionicons name="search" size={22} color={colors.primary} />
      <AppText variant="bodyMedium" color="textMuted" style={styles.ph}>
        {placeholder}
      </AppText>
      <Ionicons name="options-outline" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
