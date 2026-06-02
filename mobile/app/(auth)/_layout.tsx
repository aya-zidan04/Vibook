import { Stack } from 'expo-router';
import {
  authLoginScreenOptions,
  authSignupScreenOptions,
  authStackScreenOptions,
} from '@/navigation/authPresentation';

export default function AuthLayout() {
  return (
    <Stack screenOptions={authStackScreenOptions}>
      <Stack.Screen
        name="welcome"
        options={{
          presentation: 'card',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="login" options={authLoginScreenOptions} />
      <Stack.Screen name="signup" options={authSignupScreenOptions} />
    </Stack>
  );
}
