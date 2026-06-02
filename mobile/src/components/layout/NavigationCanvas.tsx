import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { AppBackground } from '@/components/ui/AppBackground';
import { navigationThemeFor } from '@/navigation/navigationCanvas';
import { useThemeStore } from '@/store/themeStore';

type Props = { children: ReactNode };

/**
 * Global app canvas: dark/light gradient pinned behind all navigators.
 * Navigation scenes must stay transparent (see `navigationCanvas.ts`).
 */
export function NavigationCanvas({ children }: Props) {
  const scheme = useThemeStore((s) => s.colorScheme);

  return (
    <ThemeProvider value={navigationThemeFor(scheme)}>
      <View style={styles.root}>
        <AppBackground style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <View style={styles.content}>{children}</View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
