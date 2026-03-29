import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, spacing } from '../../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <AppText variant="bodyMedium" color="surface">
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  pressed: {
    backgroundColor: colors.primaryDark,
  },
  disabled: {
    opacity: 0.55,
  },
});
