import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { transparentStackScreenOptions } from '@/navigation/navigationCanvas';

/** Full-screen auth cards — never stack transparent modals (prevents login/signup overlap). */
export const authStackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'card',
  gestureEnabled: true,
  animation: 'slide_from_right',
  ...transparentStackScreenOptions,
};

export const authLoginScreenOptions: NativeStackNavigationOptions = {
  ...authStackScreenOptions,
  animation: 'slide_from_bottom',
};

export const authSignupScreenOptions: NativeStackNavigationOptions = {
  ...authStackScreenOptions,
  animation: 'slide_from_right',
};
