import { useMemo } from 'react';
import { type ImageStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { useThemeStore } from '@/store/themeStore';

/** Transparent mark — light app chrome (pale header/canvas). */
const LOGO_MARK_LIGHT = require('../../../assets/vibook-logo-mark.png');
/** Cream squircle mark — dark app chrome. */
const LOGO_MARK_DARK = require('../../../assets/vibook-logo-mark-dark.png');

type Props = {
  /** Square edge length; scales the vi mark proportionally. */
  size?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

/** Official Vibook vi mark — asset swaps with light/dark app theme. */
export function VibookLogoMark({ size = 32, style, accessibilityLabel = 'Vibook' }: Props) {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const source = colorScheme === 'dark' ? LOGO_MARK_DARK : LOGO_MARK_LIGHT;
  const markStyle = useMemo(() => ({ width: size, height: size }), [size]);

  return (
    <Image
      source={source}
      style={[markStyle, style]}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      accessibilityIgnoresInvertColors
    />
  );
}
