export function formatPrice(amount: number, currency: string, locale: 'en' | 'ar' = 'en'): string {
  if (amount === 0 && currency === 'AED') return 'Free';
  const sym =
    currency === 'SAR'
      ? 'SAR '
      : currency === 'AED'
        ? 'AED '
        : currency === 'USD'
          ? '$'
          : `${currency} `;
  const digits =
    locale === 'ar'
      ? amount.toLocaleString('ar-JO', { maximumFractionDigits: 0, numberingSystem: 'arab' })
      : amount.toLocaleString('en-US', { maximumFractionDigits: 0, numberingSystem: 'latn' });
  return `${sym}${digits}`;
}

/** Ratings, prices with fractional part — uses Arabic-Indic digits when `locale === 'ar'`. */
export function formatDecimalForLocale(
  value: number,
  locale: 'en' | 'ar',
  fractionDigits: number,
): string {
  if (locale === 'ar') {
    return new Intl.NumberFormat('ar-JO', {
      numberingSystem: 'arab',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }
  return value.toFixed(fractionDigits);
}

/** Integers for counts (e.g. reviews) — Arabic-Indic in Arabic. */
export function formatIntForLocale(value: number, locale: 'en' | 'ar'): string {
  if (locale === 'ar') {
    return new Intl.NumberFormat('ar-JO', { numberingSystem: 'arab', maximumFractionDigits: 0 }).format(value);
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function formatDateShort(iso: string, locale: 'en' | 'ar' = 'en'): string {
  try {
    const d = new Date(iso);
    if (locale === 'ar') {
      return d.toLocaleDateString('ar-JO', {
        month: 'short',
        day: 'numeric',
        numberingSystem: 'arab',
      });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', numberingSystem: 'latn' });
  } catch {
    return iso;
  }
}
