import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { normalizeGovernorateLabel } from '@/constants/jordanGovernorates';

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
      regionLabel: 'Amman',
      setLocale: (locale) =>
        set((s) => ({
          locale,
          ...(locale === 'ar' ? { currency: 'JOD' as DisplayCurrency } : {}),
        })),
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
      onRehydrateStorage: () => (rehydrated) => {
        if (rehydrated?.locale === 'ar' && rehydrated.currency !== 'JOD') {
          useLocaleStore.setState({ currency: 'JOD' });
        }
        if (rehydrated?.regionLabel) {
          const next = normalizeGovernorateLabel(rehydrated.regionLabel);
          if (next !== rehydrated.regionLabel) {
            useLocaleStore.setState({ regionLabel: next });
          }
        }
      },
    },
  ),
);

export function useIsRTL(): boolean {
  return useLocaleStore((s) => s.locale === 'ar');
}
