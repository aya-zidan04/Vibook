import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BusinessFieldLeadSlot,
  businessFieldInputControlStyle,
  businessFieldInputFlexStyle,
  businessFieldRowLayoutStyle,
} from '@/components/business/businessFieldRow';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { leadingIconRowStyle, textAlignStart, technicalInputStyle } from '@/utils/rtlText';
import { useLocaleStore } from '@/store/localeStore';
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
  /** Email, phone digits, URLs — value stays LTR. Icon position uses {@link leadingIconRowStyle} via leftSlot. */
  technicalInput?: boolean;
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
  technicalInput = false,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isRTL } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [rowFocused, setRowFocused] = useState(false);
  const hasLeadingIcon = Boolean(leftSlot);

  return (
    <View style={[styles.wrap, wrapperStyle]}>
      <AppText variant="label" color="text">
        {label}
      </AppText>
      <View
        style={[
          styles.fieldRow,
          businessFieldRowLayoutStyle,
          hasLeadingIcon ? leadingIconRowStyle : null,
          leftSlot || rightSlot ? styles.fieldRowPad : null,
          fieldRowStyle,
          highlightOnFocus && rowFocused
            ? { borderColor: colors.primary, borderWidth: 1.5 }
            : null,
        ]}
      >
        {leftSlot ? <BusinessFieldLeadSlot>{leftSlot}</BusinessFieldLeadSlot> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setRowFocused(true)}
          onBlur={() => setRowFocused(false)}
          style={[
            styles.input,
            businessFieldInputFlexStyle(),
            businessFieldInputControlStyle(locale),
            technicalInput
              ? technicalInputStyle()
              : {
                  textAlign: textAlignStart(isRTL),
                  writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
                },
            textInputStyle,
          ]}
        />
        {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
      </View>
      {helper ? (
        <AppText variant="label" color="textMuted" style={styles.helper}>
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
      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.icon} />
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { gap: spacing.xs, marginBottom: spacing.md },
    fieldRow: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fieldRowPad: { paddingEnd: spacing.sm },
    input: {
      color: colors.text,
    },
    right: {
      justifyContent: 'center',
      paddingEnd: spacing.sm,
    },
    helper: { marginTop: 2 },
  });
}
