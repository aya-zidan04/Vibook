import { ReactNode, useMemo } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/themeStore';

const SHADOW_COLOR_LIGHT = '#55644A';
const FADE_TOP_LIGHT = 'rgba(85, 100, 74, 0.05)';

/** Dark accent family — rgb(166, 205, 87) / #A6CD57 */
const SHADOW_COLOR_DARK = '#A6CD57';
const FADE_TOP_DARK = 'rgba(166, 205, 87, 0.06)';

const FADE_HEIGHT = 14;

/** Light-mode soft bottom shadow for navigation headers. */
export function headerLightSeparationShadow(isLight: boolean): ViewStyle {
  if (!isLight) return {};
  return (
    Platform.select({
      ios: {
        shadowColor: SHADOW_COLOR_LIGHT,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
      default: {},
    }) ?? {}
  );
}

/** Dark-mode soft ambient glow beneath navigation headers. */
export function headerDarkSeparationShadow(): ViewStyle {
  return (
    Platform.select({
      ios: {
        shadowColor: SHADOW_COLOR_DARK,
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      default: {},
    }) ?? {}
  );
}

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

/** Barely-visible layer separation — shadow + soft fade under header. */
export function HeaderSeparationChrome({ children, style }: Props) {
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const shadowStyle = useMemo(
    () => (isLight ? headerLightSeparationShadow(true) : headerDarkSeparationShadow()),
    [isLight],
  );
  const fadeTop = isLight ? FADE_TOP_LIGHT : FADE_TOP_DARK;

  return (
    <View style={[styles.root, shadowStyle, style]}>
      {children}
      <LinearGradient
        colors={[fadeTop, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={styles.fade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    zIndex: 1,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -FADE_HEIGHT,
    height: FADE_HEIGHT,
  },
});
