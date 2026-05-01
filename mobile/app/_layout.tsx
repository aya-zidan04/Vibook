import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RtlLayout } from '@/components/layout/RtlLayout';
import { nativeStackFadeTransition } from '@/navigation/transitionPresets';
import { useThemeColors } from '@/theme';

export default function RootLayout() {
  const colors = useThemeColors();
  const isDark = colors.bgRgb.r < 200;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <RtlLayout>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              ...nativeStackFadeTransition,
            }}
          />
        </RtlLayout>
      </SafeAreaProvider>
    </View>
  );
}
