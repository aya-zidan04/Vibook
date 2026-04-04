import type { BusinessBookingRecord, BusinessEventRecord, BusinessProfile } from '@/types/businessHub';

function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Normalize event date string to YYYY-MM-DD for comparison. */
function eventDayKey(dateStr: string): string {
  const s = dateStr.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return '';
  return localDayKey(new Date(t));
}

/** Count bookings created on each of the last 7 calendar days (oldest → newest). */
export function bookingBucketsLast7Days(bookings: BusinessBookingRecord[]): number[] {
  const out: number[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = localDayKey(day);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const start = day.getTime();
    const end = next.getTime();
    const n = bookings.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= start && t < end;
    }).length;
    out.push(n);
  }
  return out;
}

/** Count events scheduled on each of the next 7 calendar days from today (including today). */
export function eventBucketsNext7Days(events: BusinessEventRecord[]): number[] {
  const out: number[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    const key = localDayKey(day);
    const n = events.filter((e) => {
      if (e.hidden) return false;
      return eventDayKey(e.date) === key;
    }).length;
    out.push(n);
  }
  return out;
}

export function profileCompletionRatio(profile: BusinessProfile): number {
  const fields = [
    profile.displayName,
    profile.tagline,
    profile.description,
    profile.category,
    profile.email,
    profile.phone,
    profile.mapsUrl,
    profile.website,
    profile.coverImageUri,
    profile.logoUri,
  ];
  const filled = fields.filter((f) => String(f).trim().length > 0).length;
  return filled / fields.length;
}
