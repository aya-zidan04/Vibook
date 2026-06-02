import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppLocale, DisplayCurrency } from '@/store/localeStore';
import type { ColorScheme } from '@/store/themeStore';

export const LOCALE_PERSIST_KEY = 'vibook-locale';
export const THEME_PERSIST_KEY = 'vibook-theme';

type PersistPayload<T> = {
  state: T;
  version: number;
};

/** Write a zustand-persist-compatible snapshot (sync before app reload). */
export async function writePersistSnapshot<T>(key: string, state: T, version = 0): Promise<void> {
  const payload: PersistPayload<T> = { state, version };
  await AsyncStorage.setItem(key, JSON.stringify(payload));
}

export async function persistLocaleSnapshot(
  locale: AppLocale,
  currency: DisplayCurrency,
  regionLabel: string,
): Promise<void> {
  await writePersistSnapshot(LOCALE_PERSIST_KEY, { locale, currency, regionLabel });
}

export async function persistThemeSnapshot(colorScheme: ColorScheme): Promise<void> {
  await writePersistSnapshot(THEME_PERSIST_KEY, { colorScheme });
}
