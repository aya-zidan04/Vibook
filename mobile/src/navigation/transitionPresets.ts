import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Easing, Platform } from 'react-native';

/**
 * Native stack default for customizable transitions is 500ms on iOS.
 * Slightly longer reads calmer and less abrupt without feeling slow.
 */
const NATIVE_STACK_ANIM_MS = 560;

const TAB_CROSSFADE_MS = 320;

/** Fade transitions (root shell, auth) — duration honored on iOS for `fade`. */
export const nativeStackFadeTransition: Pick<
  NativeStackNavigationOptions,
  'animation' | 'animationDuration'
> = {
  animation: 'fade',
  animationDuration: NATIVE_STACK_ANIM_MS,
};

/**
 * Drill-in stacks: on iOS `simple_push` respects `animationDuration` and pairs well
 * with full-screen back gestures. On Android, `slide_from_right` keeps the familiar push.
 */
export const nativeStackDrillInTransition: NativeStackNavigationOptions = {
  animation: Platform.OS === 'ios' ? 'simple_push' : 'slide_from_right',
  ...(Platform.OS === 'ios'
    ? { animationDuration: NATIVE_STACK_ANIM_MS, fullScreenGestureEnabled: true, animationMatchesGesture: true }
    : {}),
};

/** Bottom tabs: gentle cross-fade with ease-in-out timing (Animated JS driver). */
export const bottomTabSoftCrossFade: Pick<
  BottomTabNavigationOptions,
  'animation' | 'transitionSpec'
> = {
  animation: 'fade',
  transitionSpec: {
    animation: 'timing',
    config: {
      duration: TAB_CROSSFADE_MS,
      easing: Easing.inOut(Easing.cubic),
    },
  },
};
