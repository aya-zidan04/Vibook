import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationCanvas } from '@/components/layout/NavigationCanvas';
import { RtlLayout } from '@/components/layout/RtlLayout';
import { nativeStackFadeTransition } from '@/navigation/transitionPresets';
import { transparentStackScreenOptions } from '@/navigation/navigationCanvas';
import { transparentSheetOptions } from '@/navigation/sheetPresentation';
import { usePreferenceStoresHydrated } from '@/hooks/usePreferenceStoresHydrated';
import { useAppFonts } from '@/theme/useAppFonts';
import { useThemeStore } from '@/store/themeStore';

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const prefsHydrated = usePreferenceStoresHydrated();
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';
  const ready = fontsLoaded && prefsHydrated;

  if (!ready) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <NavigationCanvas>
      <SafeAreaProvider>
        <RtlLayout>
          <StatusBar style={statusBarStyle} />
          <Stack
            screenOptions={{
              headerShown: false,
              ...transparentStackScreenOptions,
              ...nativeStackFadeTransition,
            }}
          >
            <Stack.Screen name="(premium-sheet)" options={transparentSheetOptions} />
          </Stack>
        </RtlLayout>
      </SafeAreaProvider>
    </NavigationCanvas>
  );
}
