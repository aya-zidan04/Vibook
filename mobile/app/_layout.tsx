import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/AppBackground';
import { RtlLayout } from '@/components/layout/RtlLayout';
import { nativeStackFadeTransition } from '@/navigation/transitionPresets';
import { transparentSheetOptions } from '@/navigation/sheetPresentation';
import { useAppFonts } from '@/theme/useAppFonts';

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return (
      <AppBackground>
        <View style={{ flex: 1 }} />
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaProvider>
        <RtlLayout>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              ...nativeStackFadeTransition,
            }}
          >
            <Stack.Screen name="(auth)" options={transparentSheetOptions} />
            <Stack.Screen name="(premium-sheet)" options={transparentSheetOptions} />
          </Stack>
        </RtlLayout>
      </SafeAreaProvider>
    </AppBackground>
  );
}
