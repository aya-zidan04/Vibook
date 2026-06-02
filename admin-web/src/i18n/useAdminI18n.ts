import { useCallback, useSyncExternalStore } from 'react';
import { translations, type AdminLocale } from '@/i18n/dictionary';
import { getAdminLocale, setAdminLocale, subscribeAdminLocale } from '@/i18n/localeStore';

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function useAdminI18n() {
  const locale = useSyncExternalStore(subscribeAdminLocale, getAdminLocale, () => 'en' as AdminLocale);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const tree = translations[locale] as unknown as Record<string, unknown>;
      const fallback = translations.en as unknown as Record<string, unknown>;
      let text = getNested(tree, path) ?? getNested(fallback, path) ?? path;
      if (vars) {
        for (const [key, value] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
      }
      return text;
    },
    [locale],
  );

  const isRTL = locale === 'ar';

  return {
    t,
    locale,
    setLocale: setAdminLocale,
    isRTL,
  };
}
