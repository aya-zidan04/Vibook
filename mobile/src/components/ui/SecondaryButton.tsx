import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, spacing } from '../../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function SecondaryButton({ title, onPress, disabled, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <AppText variant="bodyMedium" color="primary">
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: `${colors.primary}12`,
  },
  disabled: {
    opacity: 0.5,
  },
});
