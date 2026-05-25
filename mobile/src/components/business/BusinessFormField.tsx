import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { textAlignStart } from '@/utils/rtlText';
import { useLocaleStore } from '@/store/localeStore';
import { radii, spacing, useThemeColors } from '@/theme';
import { inputTextStyle } from '@/theme/typography';
import type { ThemeColors } from '@/theme/palettes';

type IconName = ComponentProps<typeof Ionicons>['name'];

function fieldRowPremium(colors: ThemeColors) {
  return {
    minHeight: 54,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  };
}

function IconSlot({ name }: { name: IconName }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.iconSlot, { backgroundColor: colors.primaryMuted }]}>
      <Ionicons name={name} size={20} color={colors.primary} />
    </View>
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
      fieldRowStyle={fieldRowPremium(colors)}
      highlightOnFocus
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
      <View style={[styles.row, focused && { borderColor: colors.primary, borderWidth: 1.5 }]}>
        <View style={styles.iconCol}>
          <IconSlot name={icon} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
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

const styles = StyleSheet.create({
  iconSlot: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function createMultilineStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
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
