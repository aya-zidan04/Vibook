import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type ColorValue, type ViewStyle } from 'react-native';
import {
  pageBackgroundBase,
  pageBackgroundGradientEndColor,
  pageBackgroundGradientStartColor,
  pageBackgroundGradientVector,
} from '@/theme/darkCanvas';

type Props = {
  style?: ViewStyle;
};

/**
 * Global cinematic page background — single 145° gradient.
 * Prefer {@link AppBackground} for screens; this is the low-level canvas layer.
 */
export function DarkCanvas({ style }: Props) {
  const colors = [pageBackgroundGradientStartColor, pageBackgroundGradientEndColor] as const;

  return (
    <LinearGradient
      colors={colors as unknown as readonly [ColorValue, ColorValue, ...ColorValue[]]}
      start={pageBackgroundGradientVector.start}
      end={pageBackgroundGradientVector.end}
      style={[styles.root, { backgroundColor: pageBackgroundBase }, style]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
});
