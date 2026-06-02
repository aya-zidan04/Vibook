import { canonicalizeToEventTimeSlot } from '@/constants/eventTimeSlots';

/** Display a canonical 12h EN slot label in the active locale (API values stay EN). */
export function formatEventTimeSlotLabel(slot: string, locale: 'en' | 'ar'): string {
  const canonical = canonicalizeToEventTimeSlot(slot) ?? slot.trim();
  const m = canonical.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return slot;
  if (locale === 'en') return canonical;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return new Date(2000, 0, 1, h, min).toLocaleTimeString('ar-JO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
