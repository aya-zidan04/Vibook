import { Stack } from 'expo-router';
import { useThemeColors } from '@/theme';

const sheetOptions = {
  presentation: 'transparentModal' as const,
  animation: 'slide_from_bottom' as const,
  gestureEnabled: true,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function AuthLayout() {
  const colors = useThemeColors();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="welcome"
        options={{
          presentation: 'card',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="login" options={sheetOptions} />
      <Stack.Screen name="signup" options={sheetOptions} />
    </Stack>
  );
}
