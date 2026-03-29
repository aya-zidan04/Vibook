import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing } from '@/theme';

type BoxProps = {
  height: number;
  width?: number | `${number}%`;
  borderRadius?: number;
  style?: ViewStyle;
};

/**
 * Skeleton shimmer using RN Animated (not Reanimated) to avoid native
 * host crashes when Reanimated isn’t fully linked in the current build.
 */
export function ShimmerBox({ height, width = '100%', borderRadius = radii.md, style }: BoxProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View
      style={[
        {
          height,
          width,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: colors.surface,
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <LinearGradient
          colors={[colors.surfaceMuted, colors.surfaceHover, colors.surfaceMuted]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function ShimmerListRow() {
  return (
    <View style={rowStyles.row}>
      <ShimmerBox height={72} width={72} borderRadius={radii.lg} />
      <View style={rowStyles.col}>
        <ShimmerBox height={14} width="75%" borderRadius={radii.xs} />
        <ShimmerBox height={12} width="50%" borderRadius={radii.xs} style={{ marginTop: spacing.sm }} />
        <ShimmerBox height={12} width="40%" borderRadius={radii.xs} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  col: {
    flex: 1,
    justifyContent: 'center',
  },
});
