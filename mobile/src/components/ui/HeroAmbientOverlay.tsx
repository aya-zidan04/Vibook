import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { heroAmbientEffect } from '@/theme/visualEffects';
import { useThemeStore } from '@/store/themeStore';

type Props = {
  style?: StyleProp<ViewStyle>;
};

/** Diagonal ambient depth for hero/profile cards — pointerEvents none, no layout impact. */
export function HeroAmbientOverlay({ style }: Props) {
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const ambient = isLight ? heroAmbientEffect.light : heroAmbientEffect.dark;

  return (
    <LinearGradient
      colors={[...ambient.colors]}
      locations={[...heroAmbientEffect.locations]}
      start={heroAmbientEffect.gradientStart}
      end={heroAmbientEffect.gradientEnd}
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, style]}
    />
  );
}
