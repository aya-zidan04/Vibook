import type { Booking } from '@/types';

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

function toGcalUtcCompact(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

/** Opens in the browser / calendar app via Google Calendar “create event” URL. */
export function googleCalendarEventUrl(
  booking: Pick<Booking, 'refTitle' | 'startsAt' | 'cityName'>,
): string {
  const start = new Date(booking.startsAt);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);
  const dates = `${toGcalUtcCompact(start)}/${toGcalUtcCompact(end)}`;
  const text = encodeURIComponent(booking.refTitle);
  const details = encodeURIComponent(booking.cityName);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
}

/** Booking used for tab shortcuts: next upcoming, else pending, else most recent past. */
export function primaryShortcutBooking(
  upcoming: Booking[],
  pending: Booking[],
  past: Booking[],
): Booking | null {
  return upcoming[0] ?? pending[0] ?? past[0] ?? null;
}
