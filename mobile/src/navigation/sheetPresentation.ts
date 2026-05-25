import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/** Half-sheet modal: slide up, swipe down, transparent stack (see Login). */
export const transparentSheetOptions: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  animation: 'slide_from_bottom',
  gestureEnabled: true,
  contentStyle: { backgroundColor: 'transparent' },
};
