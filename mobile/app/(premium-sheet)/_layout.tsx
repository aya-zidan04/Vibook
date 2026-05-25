import { Stack } from 'expo-router';
import { transparentSheetOptions } from '@/navigation/sheetPresentation';

export default function PremiumSheetGroupLayout() {
  return <Stack screenOptions={{ headerShown: false, ...transparentSheetOptions }} />;
}
