import { Text, TextProps, TextStyle } from 'react-native';
import { useLocaleStore } from '@/store/localeStore';
import { useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import {
  fontFamilyForWeight,
  resolveTypographyVariant,
  typography,
  type TypographyVariant,
} from '@/theme/typography';

type Props = TextProps & {
  variant?: TypographyVariant | 'body-em' | 'meta' | 'price';
  color?: keyof ThemeColors | string;
};

function resolveTextColor(colors: ThemeColors, color: keyof ThemeColors | string): string {
  if (typeof color === 'string' && color in colors && color !== 'bgRgb') {
    const v = colors[color as keyof ThemeColors];
    if (typeof v === 'string') return v;
  }
  return color as string;
}

export function AppText({ variant = 'body', color = 'text', style, children, ...rest }: Props) {
  const colors = useThemeColors();
  const locale = useLocaleStore((s) => s.locale);
  const resolved = resolveTextColor(colors, color);
  const isRTL = locale === 'ar';
  const key = resolveTypographyVariant(variant);
  const token = typography[key];
  const fontFamily = fontFamilyForWeight(locale, token.fontWeight ?? '400');

  return (
    <Text
      style={[
        token,
        {
          color: resolved,
          fontFamily,
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
