import { useCallback, useMemo } from 'react';
import { translate } from '@/i18n/resolve';
import { useLocaleStore } from '@/store/localeStore';

/**
 * Global language strings + currency code. Persisted locale/currency from `useLocaleStore`.
 * Usage: `t('tabs.explore')`, `t('booking.title')`, etc.
 */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const currency = useLocaleStore((s) => s.currency);

  const t = useCallback(
    (path: string) => translate(locale, path) ?? path,
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
