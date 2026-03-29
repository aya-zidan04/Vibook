import { useCallback, useMemo } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { formatDisplayMoney } from '@/utils/currencyDisplay';

/**
 * Formats any mock price (SAR, AED, USD, …) into the user’s selected JOD/USD using global locale/currency.
 */
export function useFormatMoney() {
  const locale = useLocaleStore((s) => s.locale);
  const displayCurrency = useLocaleStore((s) => s.currency);

  const formatMoney = useCallback(
    (amount: number, sourceCurrency: string) =>
      formatDisplayMoney(amount, sourceCurrency, displayCurrency, locale),
    [locale, displayCurrency],
  );

  return useMemo(() => ({ formatMoney, locale, displayCurrency }), [formatMoney, locale, displayCurrency]);
}
