import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  helper?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoCorrect?: boolean;
  rightSlot?: ReactNode;
  leftSlot?: ReactNode;
  textInputStyle?: object;
  /** Extra styles for the bordered input row (e.g. partner profile “premium” fields). */
  fieldRowStyle?: object;
  /** When true, row border uses accent while the input is focused. */
  highlightOnFocus?: boolean;
  /** Wrapper around label + field (e.g. tighten vertical spacing). */
  wrapperStyle?: StyleProp<ViewStyle>;
  editable?: boolean;
};

export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  rightSlot,
  leftSlot,
  textInputStyle,
  fieldRowStyle,
  highlightOnFocus,
  wrapperStyle,
  editable = true,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isRTL } = useTranslation();
  const [rowFocused, setRowFocused] = useState(false);

  return (
    <View style={[styles.wrap, wrapperStyle]}>
      <AppText variant="caption" color="text" style={styles.label}>
        {label}
      </AppText>
      <View
        style={[
          styles.fieldRow,
          leftSlot || rightSlot ? styles.fieldRowPad : null,
          fieldRowStyle,
          highlightOnFocus && rowFocused
            ? { borderColor: colors.primary, borderWidth: 1.5 }
            : null,
        ]}
      >
        {leftSlot ? <View style={styles.left}>{leftSlot}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setRowFocused(true)}
          onBlur={() => setRowFocused(false)}
          style={[
            styles.input,
            {
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
            },
            textInputStyle,
          ]}
        />
        {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
      </View>
      {helper ? (
        <AppText variant="meta" color="textMuted" style={styles.helper}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

export function PasswordToggleIcon({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onToggle} hitSlop={10} accessibilityRole="button">
      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textSecondary} />
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { gap: spacing.xs, marginBottom: spacing.md },
    label: { fontWeight: '600' },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 52,
    },
    fieldRowPad: { paddingEnd: spacing.sm },
    input: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text,
      fontSize: 16,
    },
    left: { paddingStart: spacing.sm },
    right: { paddingEnd: spacing.sm },
    helper: { lineHeight: 18, marginTop: 2 },
  });
}
