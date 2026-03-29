import { Text, TextProps } from 'react-native';
import { useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { typography, type TypographyVariant } from '@/theme/typography';

type Props = TextProps & {
  variant?: TypographyVariant;
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
  const resolved = resolveTextColor(colors, color);

  return (
    <Text style={[typography[variant], { color: resolved }, style]} {...rest}>
      {children}
    </Text>
  );
}
