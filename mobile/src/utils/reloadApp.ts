import { DevSettings, Platform } from 'react-native';
import type { AppLocale, DisplayCurrency } from '@/store/localeStore';
import { useThemeStore } from '@/store/themeStore';
import { persistLocaleSnapshot, persistThemeSnapshot } from '@/store/persistSnapshot';
import { syncNativeRtl } from '@/utils/rtl';

/**
 * Apply locale + full app reload so native RTL/LTR and navigation chrome update.
 * Persists locale and theme independently before reload so neither preference is lost.
 */
export async function reloadAppForLocaleChange(
  locale: AppLocale,
  currency: DisplayCurrency,
  regionLabel: string,
): Promise<void> {
  syncNativeRtl(locale === 'ar');

  const colorScheme = useThemeStore.getState().colorScheme;
  await Promise.all([
    persistLocaleSnapshot(locale, currency, regionLabel),
    persistThemeSnapshot(colorScheme),
  ]);

  if (Platform.OS === 'web') {
    if (typeof globalThis.location !== 'undefined') {
      globalThis.location.reload();
    }
    return;
  }

  DevSettings.reload();
}
