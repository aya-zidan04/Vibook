import { Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, spacing } from '../../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function CategoryPill({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
    >
      <AppText
        variant="bodyMedium"
        color={selected ? 'surface' : 'textSecondary'}
        style={styles.label}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontWeight: '600',
  },
});
