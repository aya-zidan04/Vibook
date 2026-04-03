import type { AppLocale, DisplayCurrency } from '@/store/localeStore';

/** Rough mock rates to normalize mixed mock currencies into USD, then into JOD for display. */
const TO_USD: Record<string, number> = {
  SAR: 0.266,
  AED: 0.272,
  USD: 1,
  /** Backend-supported display currency; approximate USD per 1 JOD for mixed-catalog normalization. */
  JOD: 1.41,
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

function formatDigits(n: number, locale: AppLocale): string {
  if (locale === 'ar') {
    return new Intl.NumberFormat('ar-JO', { numberingSystem: 'arab', maximumFractionDigits: 0 }).format(n);
  }
  return new Intl.NumberFormat('en-US', { numberingSystem: 'latn', maximumFractionDigits: 0 }).format(n);
}

export function formatDisplayMoney(
  amount: number,
  sourceCurrency: string,
  display: DisplayCurrency,
  locale: AppLocale,
): string {
  const n = convertToDisplay(amount, sourceCurrency, display);
  const d = formatDigits(n, locale);
  if (display === 'USD') {
    return locale === 'ar' ? `\u200e$\u200f${d}` : `$${d}`;
  }
  return locale === 'ar' ? `\u200e${d}\u00a0د.أ` : `JOD ${d}`;
}
