import { useMemo } from 'react';
import { type ImageStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { useThemeStore } from '@/store/themeStore';

const WORDMARK_LIGHT = require('../../../assets/vibook-logo-wordmark-light.png');
const WORDMARK_DARK = require('../../../assets/vibook-logo-wordmark-dark.png');

const LIGHT_ASPECT = 378 / 138;
const DARK_ASPECT = 300 / 86;

type Props = {
  /** Logo height; width follows asset aspect ratio. */
  height?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

/** Horizontal vi + BOOK lockup for top navigation (Explore header). */
export function VibookHeaderWordmark({
  height = 26,
  style,
  accessibilityLabel = 'Vibook',
}: Props) {
  const isDark = useThemeStore((s) => s.colorScheme) === 'dark';
  const source = isDark ? WORDMARK_DARK : WORDMARK_LIGHT;
  const aspect = isDark ? DARK_ASPECT : LIGHT_ASPECT;
  const sizeStyle = useMemo(
    () => ({ width: Math.round(height * aspect), height }),
    [height, aspect],
  );

  return (
    <Image
      source={source}
      style={[sizeStyle, style]}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      accessibilityIgnoresInvertColors
    />
  );
}
