import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radii, shadows, spacing } from '../../theme';

type Props = {
  onPress?: () => void;
  placeholder?: string;
};

export function SearchBar({
  onPress,
  placeholder = 'Search events, venues, or cities',
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, shadows.sm, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search events"
    >
      <Ionicons name="search" size={22} color={colors.primary} />
      <AppText variant="bodyMedium" color="textMuted" style={styles.placeholder}>
        {placeholder}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 14,
    paddingHorizontal: spacing.md + 2,
  },
  placeholder: {
    flex: 1,
  },
  pressed: {
    opacity: 0.92,
  },
});
