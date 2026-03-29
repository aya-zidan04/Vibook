import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

type Variant = keyof typeof typography;

type Props = TextProps & {
  variant?: Variant;
  color?: keyof typeof colors | string;
};

export function AppText({ variant = 'body', color = 'text', style, children, ...rest }: Props) {
  const resolvedColor =
    color in colors ? colors[color as keyof typeof colors] : (color as string);

  return (
    <Text style={[typography[variant], { color: resolvedColor }, style]} {...rest}>
      {children}
    </Text>
  );
}
