import { Stack } from 'expo-router';
import { transparentStackScreenOptions } from '@/navigation/navigationCanvas';
import { nativeStackDrillInTransition } from '@/navigation/transitionPresets';

export default function EventsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...transparentStackScreenOptions,
        ...nativeStackDrillInTransition,
      }}
    />
  );
}
