import type { AppLocale, DisplayCurrency } from '@/store/localeStore';

/** Rough mock rates to normalize mixed mock currencies into USD, then into JOD for display. */
const TO_USD: Record<string, number> = {
  SAR: 0.266,
  AED: 0.272,
  USD: 1,
};

/**
 * Convert a mock price to the user's display currency (USD or JOD).
 */
export function convertToDisplay(amount: number, sourceCurrency: string, display: DisplayCurrency): number {
  const usd = amount * (TO_USD[sourceCurrency] ?? 0.266);
  if (display === 'USD') return Math.max(0, Math.round(usd));
  const jod = usd * 0.709;
  return Math.max(0, Math.round(jod));
}

export function formatDisplayMoney(
  amount: number,
  sourceCurrency: string,
  display: DisplayCurrency,
  locale: AppLocale,
): string {
  const n = convertToDisplay(amount, sourceCurrency, display);
  if (display === 'USD') {
    return locale === 'ar' ? `$${n.toLocaleString('ar-JO')}` : `$${n.toLocaleString('en-US')}`;
  }
  return locale === 'ar' ? `${n.toLocaleString('ar-JO')} د.أ` : `JOD ${n.toLocaleString('en-US')}`;
}
