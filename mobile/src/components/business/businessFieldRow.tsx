import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, type TextStyle, type ViewStyle, View } from 'react-native';
import { NavigationChevronForward } from '@/components/ui/NavigationChevron';
import {
  fontFamilyForWeight,
  typography,
  type AppLocaleFont,
} from '@/theme/typography';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { leadingIconRowStyle } from '@/utils/rtlText';

export const BUSINESS_FIELD_ROW_HEIGHT = 54;
export const BUSINESS_FIELD_ICON_SIZE = 40;
export const BUSINESS_FIELD_FONT_SIZE = 16;
export const BUSINESS_FIELD_LINE_HEIGHT = 22;

export const BUSINESS_HERO_TITLE_HEIGHT = 40;
export const BUSINESS_HERO_TAGLINE_HEIGHT = 34;

/** Premium partner profile input row chrome. */
export function businessFieldRowStyle(colors: ThemeColors): object {
  return {
    height: BUSINESS_FIELD_ROW_HEIGHT,
    minHeight: BUSINESS_FIELD_ROW_HEIGHT,
    maxHeight: BUSINESS_FIELD_ROW_HEIGHT,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden' as const,
  };
}

/** Shared flex row layout for icon + value fields. */
export const businessFieldRowLayoutStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  height: BUSINESS_FIELD_ROW_HEIGHT,
  minHeight: BUSINESS_FIELD_ROW_HEIGHT,
  maxHeight: BUSINESS_FIELD_ROW_HEIGHT,
  overflow: 'hidden',
};

/** Business field row — icon locked to the physical left in RTL and LTR. */
export const businessLeadingIconRowStyle: ViewStyle = {
  ...businessFieldRowLayoutStyle,
  ...leadingIconRowStyle,
};

type IconSlotProps = {
  children: ReactNode;
};

/** 40×40 leading icon container — vertically centered in field rows. */
export function BusinessFieldIconSlot({ children }: IconSlotProps) {
  const colors = useThemeColors();
  return (
    <View style={[styles.iconSlot, { backgroundColor: colors.primaryMuted }]}>{children}</View>
  );
}

/** Wraps leading slots (icons, phone prefix) for vertical centering in a field row. */
export function BusinessFieldLeadSlot({ children }: IconSlotProps) {
  return <View style={styles.leadSlot}>{children}</View>;
}

/** Shared single-line typography (inputs + picker values). */
export function businessFieldInputTextStyle(locale: AppLocaleFont): TextStyle {
  return {
    fontSize: BUSINESS_FIELD_FONT_SIZE,
    lineHeight: BUSINESS_FIELD_LINE_HEIGHT,
    fontFamily: fontFamilyForWeight(locale, typography['body-lg'].fontWeight ?? '400'),
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  };
}

/**
 * TextInput flex style — sits directly in the 54px row.
 * Vertical centering comes from the row's alignItems: 'center', not input height hacks.
 */
export function businessFieldInputFlexStyle(): ViewStyle {
  return {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
  };
}

/** Single-line TextInput typography — no fixed height (avoids iOS overflow below row). */
export function businessFieldInputControlStyle(locale: AppLocaleFont): TextStyle {
  return {
    ...businessFieldInputTextStyle(locale),
    padding: 0,
    margin: 0,
    ...(Platform.OS === 'android'
      ? {
          height: BUSINESS_FIELD_LINE_HEIGHT,
          textAlignVertical: 'center' as const,
          includeFontPadding: false,
        }
      : {}),
  };
}

/** @deprecated Row centering uses {@link businessFieldInputFlexStyle} on TextInput directly. */
export function businessFieldInputSlotStyle(): ViewStyle {
  return businessFieldInputFlexStyle();
}

/** Flex slot for picker / static value text inside a field row. */
export function businessFieldValueSlotStyle(): ViewStyle {
  return {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  };
}

/** Picker value — identical metrics to TextInput text. */
export function businessFieldValueTextStyle(locale: AppLocaleFont): TextStyle {
  return {
    ...businessFieldInputTextStyle(locale),
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const, includeFontPadding: false }
      : {}),
  };
}

type FieldValueTextProps = {
  locale: AppLocaleFont;
  color: string;
  alignStyle?: TextStyle;
  numberOfLines?: number;
  children: ReactNode;
};

/** Picker display text aligned exactly like a TextInput value. */
export function BusinessFieldValueText({
  locale,
  color,
  alignStyle,
  numberOfLines = 1,
  children,
}: FieldValueTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[styles.valueText, businessFieldValueTextStyle(locale), { color }, alignStyle]}
    >
      {children}
    </Text>
  );
}

/** Picker value row — full width inside LTR-locked field rows. */
export function businessFieldPickerValueRowStyle(): ViewStyle {
  return {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  };
}

type PickerValueProps = {
  locale: AppLocaleFont;
  isRTL: boolean;
  color: string;
  alignStyle?: TextStyle;
  children: ReactNode;
};

/**
 * Category / governorate picker value.
 * Parent rows use `leadingIconRowStyle` (physical LTR): word left, chevron right in both locales.
 */
export function BusinessFieldPickerValue({
  locale,
  color,
  children,
}: PickerValueProps) {
  const colors = useThemeColors();
  return (
    <View style={businessFieldPickerValueRowStyle()}>
      <Text
        numberOfLines={1}
        style={[
          businessFieldValueTextStyle(locale),
          styles.pickerValueText,
          { color, textAlign: 'left' },
        ]}
      >
        {children}
      </Text>
      <NavigationChevronForward size={18} color={colors.icon} />
    </View>
  );
}

/** Inline cluster (phone prefix, etc.) — one shared vertical center line. */
export const businessFieldInlineClusterStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  height: BUSINESS_FIELD_LINE_HEIGHT,
};

/** Hero business name — centered single line. */
export function businessHeroTitleControlStyle(locale: AppLocaleFont): TextStyle {
  const token = typography.h1;
  const fontFamily = fontFamilyForWeight(locale, token.fontWeight ?? '700');
  return {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    fontFamily,
    width: '100%',
    minHeight: BUSINESS_HERO_TITLE_HEIGHT,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const, includeFontPadding: false }
      : {}),
  };
}

/** Hero tagline — centered single line. */
export function businessHeroTaglineControlStyle(locale: AppLocaleFont): TextStyle {
  return {
    ...businessFieldInputTextStyle(locale),
    width: '100%',
    minHeight: BUSINESS_HERO_TAGLINE_HEIGHT,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const, includeFontPadding: false }
      : {}),
  };
}

/** Multiline description — top-aligned, consistent line metrics, no clipping. */
export function businessMultilineInputStyle(locale: AppLocaleFont): TextStyle {
  return {
    ...businessFieldInputTextStyle(locale),
    width: '100%',
    padding: 0,
    margin: 0,
    textAlignVertical: 'top' as const,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  };
}

/** @deprecated Use {@link businessFieldInputFlexStyle} + {@link businessFieldInputControlStyle}. */
export function businessFieldInputLayoutStyle(): TextStyle {
  return { flex: 1, minWidth: 0, margin: 0, padding: 0 };
}

/** @deprecated Use {@link businessFieldValueTextStyle}. */
export function businessFieldValueStyle(): TextStyle {
  return businessFieldValueTextStyle('en');
}

/** @deprecated Use {@link businessHeroTitleControlStyle}. */
export function businessHeroTitleLayoutStyle(_lineHeight: number, _minHeight = 40): TextStyle {
  return businessHeroTitleControlStyle('en');
}

/** @deprecated Use {@link businessHeroTaglineControlStyle}. */
export function businessHeroSubtitleLayoutStyle(_minHeight = 34): TextStyle {
  return businessHeroTaglineControlStyle('en');
}

/** @deprecated Use {@link businessFieldInputLayoutStyle}. */
export const businessFieldInputStyle = businessFieldInputLayoutStyle();

const styles = StyleSheet.create({
  iconSlot: {
    width: BUSINESS_FIELD_ICON_SIZE,
    height: BUSINESS_FIELD_ICON_SIZE,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadSlot: {
    justifyContent: 'center',
    paddingLeft: spacing.sm,
  },
  valueText: {
    width: '100%',
  },
  pickerValueText: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
});
