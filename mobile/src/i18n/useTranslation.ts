import { useCallback, useMemo } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { translations } from './dictionary';

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

/**
 * Global language strings + currency code. Persisted locale/currency from `useLocaleStore`.
 * Usage: `t('tabs.explore')`, `t('booking.title')`, etc.
 */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const currency = useLocaleStore((s) => s.currency);

  const t = useCallback(
    (path: string) => {
      const tree = translations[locale] as unknown as Record<string, unknown>;
      const fallback = translations.en as unknown as Record<string, unknown>;
      return getNested(tree, path) ?? getNested(fallback, path) ?? path;
    },
    [locale],
  );

  const isRTL = locale === 'ar';

  return useMemo(
    () => ({
      t,
      locale,
      currency,
      isRTL,
    }),
    [t, locale, currency, isRTL],
  );
}
