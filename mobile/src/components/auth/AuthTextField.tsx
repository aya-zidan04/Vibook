import type { ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme';

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
}: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color="text" style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.fieldRow, leftSlot || rightSlot ? styles.fieldRowPad : null]}>
        {leftSlot ? <View style={styles.left}>{leftSlot}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          style={[styles.input, textInputStyle]}
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
  return (
    <Pressable onPress={onToggle} hitSlop={10} accessibilityRole="button">
      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  fieldRowPad: { paddingRight: spacing.sm },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 16,
  },
  left: { paddingLeft: spacing.sm },
  right: { paddingRight: spacing.sm },
  helper: { lineHeight: 18, marginTop: 2 },
});
