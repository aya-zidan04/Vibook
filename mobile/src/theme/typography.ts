import type { TextStyle } from 'react-native';

/** English UI font (loaded via expo-font in root layout). */
export const fontFamilyEn = 'DMSans_400Regular';

export const fontFamiliesEn = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  extrabold: 'DMSans_800ExtraBold',
} as const;

/** Arabic UI font. */
export const fontFamilyAr = 'Tajawal_400Regular';

export const fontFamiliesAr = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  semibold: 'Tajawal_700Bold',
  bold: 'Tajawal_700Bold',
  extrabold: 'Tajawal_800ExtraBold',
} as const;

export type AppLocaleFont = 'en' | 'ar';

export function fontFamilyForWeight(
  locale: AppLocaleFont,
  weight: TextStyle['fontWeight'],
): string {
  const families = locale === 'ar' ? fontFamiliesAr : fontFamiliesEn;
  switch (weight) {
    case '800':
    case '900':
      return families.extrabold;
    case '700':
    case 'bold':
      return families.bold;
    case '600':
      return families.semibold;
    case '500':
      return families.medium;
    default:
      return families.regular;
  }
}

function style(
  fontSize: number,
  fontWeight: TextStyle['fontWeight'],
  lineHeight: number,
  letterSpacing?: number,
): TextStyle {
  return {
    fontSize,
    fontWeight,
    lineHeight,
    ...(letterSpacing != null ? { letterSpacing } : {}),
  };
}

/** Single source of truth — mirrored in admin `admin-theme.css` as `--vb-text-*`. */
export const typography = {
  display: { ...style(32, '800', 40, -0.5) },
  h1: { ...style(26, '700', 32, -0.3) },
  h2: { ...style(20, '700', 26, -0.2) },
  h3: { ...style(17, '600', 24, -0.1) },
  'body-lg': { ...style(16, '400', 24) },
  body: { ...style(15, '400', 22) },
  'body-em': { ...style(15, '600', 22) },
  caption: { ...style(13, '400', 18) },
  label: { ...style(12, '600', 16, 0.2) },
  overline: { ...style(12, '600', 16, 0.5) },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Map legacy variant names → new scale (for gradual migration). */
export const typographyAliases: Record<string, TypographyVariant> = {
  'body-em': 'body-em',
  bodyMedium: 'body-em',
  meta: 'label',
  price: 'h3',
};

export function resolveTypographyVariant(variant: string): TypographyVariant {
  if (variant in typography) {
    return variant as TypographyVariant;
  }
  return typographyAliases[variant] ?? 'body';
}

/** Text inputs — typography token + locale font family. */
export function inputTextStyle(
  locale: AppLocaleFont,
  variant: TypographyVariant = 'body-lg',
): TextStyle {
  const token = typography[variant];
  return {
    ...token,
    fontFamily: fontFamilyForWeight(locale, token.fontWeight ?? '400'),
  };
}

/** React Navigation tab labels — `label` token + locale semibold family. */
export function tabBarLabelTextStyle(locale: AppLocaleFont): TextStyle {
  return {
    ...typography.label,
    fontFamily: fontFamilyForWeight(locale, '600'),
    marginTop: 2,
  };
}
