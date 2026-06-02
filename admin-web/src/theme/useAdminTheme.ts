import { useSyncExternalStore } from 'react';
import {
  getAdminTheme,
  setAdminTheme,
  subscribeAdminTheme,
  type AdminThemeMode,
} from '@/theme/themeStore';

export function useAdminTheme() {
  const theme = useSyncExternalStore(subscribeAdminTheme, getAdminTheme, () => 'dark' as AdminThemeMode);
  return { theme, setTheme: setAdminTheme };
}
