import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import {
  BusinessFieldIconSlot,
  businessFieldRowStyle,
} from '@/components/business/businessFieldRow';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { textAlignStart, leadingIconRowStyle } from '@/utils/rtlText';
import { useLocaleStore } from '@/store/localeStore';
import { radii, spacing, useThemeColors } from '@/theme';
import { inputTextStyle } from '@/theme/typography';
import type { ThemeColors } from '@/theme/palettes';

type IconName = ComponentProps<typeof Ionicons>['name'];

function IconSlot({ name }: { name: IconName }) {
  const colors = useThemeColors();
  return (
    <BusinessFieldIconSlot>
      <Ionicons name={name} size={20} color={colors.primary} />
    </BusinessFieldIconSlot>
  );
}

type TextFieldProps = {
  icon: IconName;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoCorrect?: boolean;
  fieldRowStyle?: object;
  highlightOnFocus?: boolean;
  wrapperStyle?: StyleProp<ViewStyle>;
  technicalInput?: boolean;
};

export function BusinessIconTextField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  fieldRowStyle,
  highlightOnFocus,
  wrapperStyle,
  technicalInput,
}: TextFieldProps) {
  const colors = useThemeColors();
  return (
    <AuthTextField
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      leftSlot={<IconSlot name={icon} />}
      fieldRowStyle={fieldRowStyle ?? businessFieldRowStyle(colors)}
      highlightOnFocus={highlightOnFocus ?? true}
      wrapperStyle={wrapperStyle}
      technicalInput={technicalInput ?? false}
    />
  );
}

type MultilineProps = {
  icon: IconName;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export function BusinessIconMultiline({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  minHeight = 100,
}: MultilineProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createMultilineStyles(colors), [colors]);
  const { isRTL } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color="text">
        {label}
      </AppText>
      <View style={[styles.row, leadingIconRowStyle, focused && { borderColor: colors.primary, borderWidth: 1.5 }]}>
        <View style={styles.iconCol}>
          <IconSlot name={icon} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          multiline
          textAlignVertical="top"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            inputTextStyle(locale),
            {
              color: colors.text,
              minHeight,
              textAlign: textAlignStart(isRTL),
              writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
            },
          ]}
        />
      </View>
    </View>
  );
}

function createMultilineStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    row: {
      alignItems: 'flex-start',
      borderRadius: radii.xl,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      gap: spacing.sm,
    },
    iconCol: {
      paddingTop: 4,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.xs,
      paddingEnd: spacing.sm,
    },
  });
}
