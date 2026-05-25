import { Feather } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from '@/i18n/useTranslation';

type LogoutSpriteProps = {
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
};

/** Box-with-arrow logout glyph (Feather `log-out`), mirrored in RTL. */
export function LogoutSprite({ size = 20, color, style }: LogoutSpriteProps) {
  const { isRTL } = useTranslation();

  return (
    <View style={[styles.wrap, isRTL && styles.mirror, style]} accessibilityElementsHidden importantForAccessibility="no">
      <Feather name="log-out" size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mirror: {
    transform: [{ scaleX: -1 }],
  },
});
