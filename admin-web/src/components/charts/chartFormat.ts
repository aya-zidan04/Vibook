import { getAdminLocale } from '@/i18n/localeStore';

/** Locale-aware short date for chart X-axis labels. */
export function formatChartDay(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z');
  const locale = getAdminLocale() === 'ar' ? 'ar-JO' : 'en-US';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}
