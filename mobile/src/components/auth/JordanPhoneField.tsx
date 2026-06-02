import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AuthTextField } from '@/components/auth/AuthTextField';
import {
  businessFieldInlineClusterStyle,
  businessFieldInputTextStyle,
  BUSINESS_FIELD_LINE_HEIGHT,
} from '@/components/business/businessFieldRow';
import { AppText } from '@/components/ui/AppText';
import { useLocaleStore } from '@/store/localeStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type PrefixAppearance = 'default' | 'business';

type PrefixProps = {
  appearance?: PrefixAppearance;
};

/**
 * Jordan country prefix — always rendered on the physical left (parent row uses direction: ltr).
 * Layout: [ 🇯🇴 +962 | ]
 */
export function JordanPhonePrefix({ appearance = 'default' }: PrefixProps) {
  const colors = useThemeColors();
  const locale = useLocaleStore((s) => s.locale);
  const styles = useMemo(() => createPrefixStyles(colors), [colors]);

  if (appearance === 'business') {
    return (
      <View style={businessFieldInlineClusterStyle}>
        <View style={styles.flagWrap}>
          <Text style={styles.flagBusiness}>🇯🇴</Text>
        </View>
        <Text style={[businessFieldInputTextStyle(locale), { color: colors.textSecondary }]}>
          +962
        </Text>
        <View style={[styles.sepBusiness, { backgroundColor: colors.border }]} />
      </View>
    );
  }

  return (
    <View style={styles.cluster}>
      <AppText variant="h2">🇯🇴</AppText>
      <AppText variant="body-em" color="textSecondary">
        +962
      </AppText>
      <View style={[styles.sepDefault, { backgroundColor: colors.border }]} />
    </View>
  );
}

type JordanPhoneFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  appearance?: PrefixAppearance;
  fieldRowStyle?: object;
  highlightOnFocus?: boolean;
  wrapperStyle?: StyleProp<ViewStyle>;
  editable?: boolean;
};

/** Shared Jordan phone input — prefix cluster locked to the physical left in RTL and LTR. */
export function JordanPhoneField({
  label,
  value,
  onChangeText,
  placeholder,
  appearance = 'default',
  fieldRowStyle,
  highlightOnFocus,
  wrapperStyle,
  editable = true,
}: JordanPhoneFieldProps) {
  return (
    <AuthTextField
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType="number-pad"
      autoCapitalize="none"
      autoCorrect={false}
      editable={editable}
      technicalInput
      leftSlot={<JordanPhonePrefix appearance={appearance} />}
      fieldRowStyle={fieldRowStyle}
      highlightOnFocus={highlightOnFocus}
      wrapperStyle={wrapperStyle}
    />
  );
}

function createPrefixStyles(colors: ThemeColors) {
  return StyleSheet.create({
    cluster: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sepDefault: {
      width: 1,
      height: 26,
    },
    flagWrap: {
      height: BUSINESS_FIELD_LINE_HEIGHT,
      justifyContent: 'center',
    },
    flagBusiness: {
      fontSize: 18,
      lineHeight: BUSINESS_FIELD_LINE_HEIGHT,
    },
    sepBusiness: {
      width: 1,
      height: BUSINESS_FIELD_LINE_HEIGHT - 2,
      marginLeft: 2,
    },
  });
}
