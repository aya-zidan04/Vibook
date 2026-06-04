import { useMemo } from 'react';
import { View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useThemeStore } from '@/store/themeStore';

const WORDMARK_LIGHT = require('../../../assets/vibook-logo-wordmark-light.png');
const WORDMARK_DARK = require('../../../assets/vibook-logo-wordmark-dark.png');

const WORDMARK_WIDTH = 300;
const WORDMARK_HEIGHT = 86;
const WORDMARK_ASPECT = WORDMARK_WIDTH / WORDMARK_HEIGHT;

export function headerWordmarkLayout(height: number): { width: number; height: number } {
  return { width: Math.round(height * WORDMARK_ASPECT), height };
}

type Props = {
  /** Logo height; width follows asset aspect ratio. */
  height?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Horizontal vi + BOOK lockup for top navigation (Explore header). */
export function VibookHeaderWordmark({
  height = 26,
  style,
  containerStyle,
  accessibilityLabel = 'Vibook',
}: Props) {
  const isDark = useThemeStore((s) => s.colorScheme) === 'dark';
  const source = isDark ? WORDMARK_DARK : WORDMARK_LIGHT;
  const layout = useMemo(() => headerWordmarkLayout(height), [height]);

  return (
    <View
      style={[
        {
          width: layout.width,
          height: layout.height,
          flexShrink: 0,
          flexGrow: 0,
          overflow: 'visible',
        },
        containerStyle,
      ]}
      collapsable={false}
    >
      <Image
        source={source}
        style={[{ width: layout.width, height: layout.height }, style]}
        contentFit="contain"
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
