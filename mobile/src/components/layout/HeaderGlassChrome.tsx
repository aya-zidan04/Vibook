import { ReactNode, useMemo } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { headerGlassEffect } from '@/theme/visualEffects';
import { useThemeColors } from '@/theme';
import { useThemeStore } from '@/store/themeStore';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

/** Frosted-glass navigation header — blur + translucent tint for content scrolling underneath. */
export function HeaderGlassChrome({ children, style }: Props) {
  const colors = useThemeColors();
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const fx = headerGlassEffect;
  const tint = isLight ? 'light' : 'dark';
  const intensity = isLight ? fx.blurIntensity.light : fx.blurIntensity.dark;
  const fillOpacity = isLight ? fx.fillOpacity.light : fx.fillOpacity.dark;
  const borderColor = isLight ? fx.borderColor.light : fx.borderColor.dark;

  const fillColor = useMemo(() => {
    const { r, g, b } = colors.bgRgb;
    return `rgba(${r}, ${g}, ${b}, ${fillOpacity})`;
  }, [colors.bgRgb, fillOpacity]);

  const lightShadow = useMemo(
    () =>
      isLight
        ? (Platform.select({
            ios: {
              shadowColor: fx.shadow.shadowColor,
              shadowOpacity: fx.shadow.shadowOpacity,
              shadowRadius: fx.shadow.shadowRadius,
              shadowOffset: fx.shadow.shadowOffset,
            },
            android: { elevation: fx.shadow.androidElevation },
            default: {},
          }) ?? {})
        : {},
    [fx.shadow.androidElevation, fx.shadow.shadowColor, fx.shadow.shadowOffset, fx.shadow.shadowOpacity, fx.shadow.shadowRadius, isLight],
  );

  return (
    <View style={[styles.root, lightShadow, { borderBottomColor: borderColor }, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      ) : null}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: fillColor }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
