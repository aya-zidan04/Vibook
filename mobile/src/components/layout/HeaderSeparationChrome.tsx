import { ReactNode, useMemo } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderGlassChrome } from '@/components/layout/HeaderGlassChrome';
import { headerSeparationEffect } from '@/theme/visualEffects';
import { useThemeStore } from '@/store/themeStore';

/** Light-mode soft bottom shadow for navigation headers. */
export function headerLightSeparationShadow(isLight: boolean): ViewStyle {
  if (!isLight) return {};
  const fx = headerSeparationEffect.light;
  return (
    Platform.select({
      ios: {
        shadowColor: fx.shadowColor,
        shadowOpacity: fx.shadowOpacity,
        shadowRadius: fx.shadowRadius,
        shadowOffset: fx.shadowOffset,
      },
      android: { elevation: fx.androidElevation },
      default: {},
    }) ?? {}
  );
}

/** Dark-mode soft ambient glow beneath navigation headers. */
export function headerDarkSeparationShadow(): ViewStyle {
  const fx = headerSeparationEffect.dark;
  return (
    Platform.select({
      ios: {
        shadowColor: fx.shadowColor,
        shadowOpacity: fx.shadowOpacity,
        shadowRadius: fx.shadowRadius,
        shadowOffset: fx.shadowOffset,
      },
      android: { elevation: fx.androidElevation },
      default: {},
    }) ?? {}
  );
}

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

/** Navigation header chrome — frosted glass in light mode, soft shadow/fade in dark. Not for photo hero overlays (use plain `DetailHeader` there). */
export function HeaderSeparationChrome({ children, style }: Props) {
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const shadowStyle = useMemo(() => headerDarkSeparationShadow(), []);
  const fadeTop = headerSeparationEffect.dark.fadeTop;

  if (isLight) {
    return <HeaderGlassChrome style={style}>{children}</HeaderGlassChrome>;
  }

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
    bottom: -headerSeparationEffect.fadeHeight,
    height: headerSeparationEffect.fadeHeight,
  },
});
