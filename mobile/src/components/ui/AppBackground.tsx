import { ReactNode, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type ColorValue, type ViewStyle } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import {
  appBackgroundColorsFor,
  appBackgroundEndFor,
  appBackgroundStartFor,
} from '@/theme/appBackground';

type Props = {
  children?: ReactNode;
  style?: ViewStyle;
  pointerEvents?: 'box-none' | 'none' | 'auto' | 'box-only';
};

export function AppBackground({ children, style, pointerEvents = 'box-none' }: Props) {
  const scheme = useThemeStore((s) => s.colorScheme);
  const colors = useMemo(
    () => appBackgroundColorsFor(scheme) as unknown as readonly [ColorValue, ColorValue, ...ColorValue[]],
    [scheme],
  );
  const start = useMemo(() => appBackgroundStartFor(scheme), [scheme]);
  const end = useMemo(() => appBackgroundEndFor(scheme), [scheme]);

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[styles.container, style]}
      pointerEvents={pointerEvents}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export {
  appBackgroundColorsFor,
  appBackgroundLocationsFor,
  appBackgroundStartFor,
  appBackgroundEndFor,
  appBackgroundBaseFor,
  APP_BACKGROUND_COLORS,
  APP_BACKGROUND_BASE,
} from '@/theme/appBackground';
