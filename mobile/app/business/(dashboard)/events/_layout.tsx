import { Stack } from 'expo-router';
import { nativeStackDrillInTransition } from '@/navigation/transitionPresets';
import { useThemeColors } from '@/theme';

export default function EventsStackLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        ...nativeStackDrillInTransition,
      }}
    />
  );
}
