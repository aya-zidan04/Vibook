import { Text, TextProps } from 'react-native';
import { colors } from '@/theme/colors';
import { typography, type TypographyVariant } from '@/theme/typography';

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: keyof typeof colors | string;
};

export function AppText({
  variant = 'body',
  color = 'text',
  style,
  children,
  ...rest
}: Props) {
  const resolved =
    color in colors ? colors[color as keyof typeof colors] : (color as string);

  return (
    <Text style={[typography[variant], { color: resolved }, style]} {...rest}>
      {children}
    </Text>
  );
}
