import { getAdminLocale } from '@/i18n/localeStore';

function adminDateLocale(): string {
  return getAdminLocale() === 'ar' ? 'ar-JO' : 'en-US';
}

/** YYYY-MM-DD from API → locale date (no timezone shift). */
export function formatEventDate(date: string | null | undefined): string {
  if (date == null || date === '') return '—';
  const m = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return date;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  try {
    return new Date(y, mo, d).toLocaleDateString(adminDateLocale(), { dateStyle: 'medium' });
  } catch {
    return date;
  }
}

/** Date + slot labels exactly as stored in DB (API sortOrder). */
export function formatEventSchedule(
  eventDate: string | null | undefined,
  timeSlots: string[] | null | undefined,
): string {
  const dateLabel = formatEventDate(eventDate);
  const slots = (timeSlots ?? []).filter((s) => s?.trim());
  if (!slots.length) return dateLabel;
  return `${dateLabel} · ${slots.join(', ')}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (iso == null || iso === '') return '—';
  try {
    return new Date(iso).toLocaleString(adminDateLocale(), {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

export function formatFullName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(' ').trim() || '—';
}
