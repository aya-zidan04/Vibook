import { useRouter, type Href } from 'expo-router';

/** Close sheet: pop stack or replace to a tab fallback. */
export function useSheetClose(fallback: Href = '/(tabs)/me') {
  const router = useRouter();
  return () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallback);
  };
}
