import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/themeStore';

/** Barely-visible olive wash — top-left lime, transparent center, bottom-right sage. */
const AMBIENT_LIGHT = [
  'rgba(167, 220, 43, 0.08)',
  'transparent',
  'rgba(139, 194, 73, 0.06)',
] as const;

const AMBIENT_DARK = [
  'rgba(167, 220, 43, 0.07)',
  'transparent',
  'rgba(139, 194, 73, 0.045)',
] as const;

const AMBIENT_LOCATIONS = [0, 0.5, 1] as const;

type Props = {
  style?: StyleProp<ViewStyle>;
};

/** Diagonal ambient depth for hero/profile cards — pointerEvents none, no layout impact. */
export function HeroAmbientOverlay({ style }: Props) {
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';

  return (
    <LinearGradient
      colors={isLight ? [...AMBIENT_LIGHT] : [...AMBIENT_DARK]}
      locations={[...AMBIENT_LOCATIONS]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, style]}
    />
  );
}
