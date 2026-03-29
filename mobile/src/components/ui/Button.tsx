import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme';

type BaseProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, disabled, loading, style }: BaseProps) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.primary,
        pressed && !off && styles.primaryPressed,
        off && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <AppText variant="bodyMedium" style={styles.primaryLabel}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  disabled,
  style,
}: Omit<BaseProps, 'loading'>) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondary,
        pressed && !disabled && styles.secondaryPressed,
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
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryPressed: {
    opacity: 0.88,
  },
  primaryLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.full,
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: colors.surface,
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceHover,
  },
  disabled: {
    opacity: 0.45,
  },
});
