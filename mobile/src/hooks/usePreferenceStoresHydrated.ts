import { useEffect, useState } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { useThemeStore } from '@/store/themeStore';

function preferenceStoresHydrated(): boolean {
  return useLocaleStore.persist.hasHydrated() && useThemeStore.persist.hasHydrated();
}

/** True once locale + theme AsyncStorage rehydration has finished (avoids default-state flash/overwrite). */
export function usePreferenceStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(preferenceStoresHydrated);

  useEffect(() => {
    if (preferenceStoresHydrated()) {
      setHydrated(true);
      return;
    }

    const markIfReady = () => {
      if (preferenceStoresHydrated()) setHydrated(true);
    };

    const unsubLocale = useLocaleStore.persist.onFinishHydration(markIfReady);
    const unsubTheme = useThemeStore.persist.onFinishHydration(markIfReady);

    setHydrated(preferenceStoresHydrated());

    return () => {
      unsubLocale();
      unsubTheme();
    };
  }, []);

  return hydrated;
}
