import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/AppText';
import { useButtonVariants, useThemeColors, useThemeGradients } from '@/theme';
import type { ThemeButtons } from '@/theme/designSystem';
import type { ThemeColors } from '@/theme/palettes';
import { buttonMetrics, createShadows, spacing } from '@/theme';

/** Enforce capsule shape when screens pass extra `style` on buttons. */
export const pillButtonStyle: ViewStyle = {
  borderRadius: buttonMetrics.borderRadius,
};

type BaseProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  /** Taller sheet CTAs; same pill radius as default. */
  sheet?: boolean;
};

function buttonShape(style?: ViewStyle, sheet?: boolean): ViewStyle {
  const { borderRadius: _radius, ...rest } = style ?? {};
  return {
    ...buttonMetrics,
    ...(sheet ? { minHeight: 58 } : null),
    ...rest,
    borderRadius: buttonMetrics.borderRadius,
  };
}

export function PrimaryButton({ title, onPress, disabled, loading, style, sheet }: BaseProps) {
  const colors = useThemeColors();
  const gradients = useThemeGradients();
  const buttons = useButtonVariants();
  const styles = useMemo(() => createStyles(colors, buttons), [colors, buttons]);
  const sheetShadow = sheet ? createShadows(colors).sm : undefined;
  const shape = buttonShape(style, sheet);
  const off = disabled || loading;
  const variant = buttons.primary;

  const inner = loading ? (
    <ActivityIndicator color={variant.textColor} />
  ) : (
    <AppText variant="body-em" style={{ color: variant.textColor }}>
      {title}
    </AppText>
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        style?.width != null && { width: style.width },
        style?.alignSelf != null && { alignSelf: style.alignSelf },
        pressed && !off && { opacity: variant.pressedOpacity },
        off && styles.disabled,
      ]}
    >
      {variant.useGradient && !off ? (
        <LinearGradient
          colors={[...gradients.button]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primary, shape, sheetShadow]}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View style={[styles.primary, shape, sheetShadow, { backgroundColor: variant.backgroundColor }]}>
          {inner}
        </View>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  disabled,
  style,
  sheet,
}: Omit<BaseProps, 'loading'>) {
  const colors = useThemeColors();
  const buttons = useButtonVariants();
  const styles = useMemo(() => createStyles(colors, buttons), [colors, buttons]);
  const variant = buttons.secondary;
  const sheetShadow = sheet ? createShadows(colors).sm : undefined;
  const shape = buttonShape(style, sheet);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondary,
        shape,
        sheetShadow,
        {
          backgroundColor: variant.backgroundColor,
          borderColor: variant.borderColor,
          borderWidth: variant.borderWidth,
        },
        pressed && !disabled && { opacity: variant.pressedOpacity },
        disabled && styles.disabled,
      ]}
    >
      <AppText variant="body-em" style={{ color: variant.textColor }}>
        {title}
      </AppText>
    </Pressable>
  );
}

function createStyles(_colors: ThemeColors, _buttons: ThemeButtons) {
  return StyleSheet.create({
    primary: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: {
      opacity: 0.45,
    },
  });
}
