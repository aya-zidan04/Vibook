import { getAdminLocale } from '@/i18n/localeStore';

export function formatDateTime(iso: string | null | undefined): string {
  if (iso == null || iso === '') return '—';
  try {
    const locale = getAdminLocale() === 'ar' ? 'ar-JO' : 'en-US';
    return new Date(iso).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatFullName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(' ').trim() || '—';
}
