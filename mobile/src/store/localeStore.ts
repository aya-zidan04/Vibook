import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppLocale = 'en' | 'ar';
export type DisplayCurrency = 'USD' | 'JOD';

type LocaleState = {
  locale: AppLocale;
  currency: DisplayCurrency;
  /** Region label for header (e.g. Jordan). */
  regionLabel: string;
  setLocale: (locale: AppLocale) => void;
  setCurrency: (currency: DisplayCurrency) => void;
  setRegionLabel: (label: string) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      currency: 'USD',
      regionLabel: 'Jordan',
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      setRegionLabel: (regionLabel) => set({ regionLabel }),
    }),
    {
      name: 'vibook-locale',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        locale: s.locale,
        currency: s.currency,
        regionLabel: s.regionLabel,
      }),
    },
  ),
);

export function useIsRTL(): boolean {
  return useLocaleStore((s) => s.locale === 'ar');
}
