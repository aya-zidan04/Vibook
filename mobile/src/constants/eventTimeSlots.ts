/** 30-minute steps, 12h labels — shared by business event editor and event → catalog mapping. */
export const EVENT_TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? 0 : 30;
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`;
});

/** Minutes from local midnight for a known slot label; null if not a canonical slot. */
export function eventTimeSlotToMinutes(slot: string): number | null {
  const idx = EVENT_TIME_OPTIONS.indexOf(slot.trim());
  if (idx < 0) return null;
  const hour = Math.floor(idx / 2);
  const minute = idx % 2 === 0 ? 0 : 30;
  return hour * 60 + minute;
}

/**
 * Maps a stored or loose 12h label onto the nearest canonical 30m slot label.
 * Returns null if the string cannot be parsed as 12h time.
 */
export function canonicalizeToEventTimeSlot(raw: string): string | null {
  const t = raw.trim();
  if (EVENT_TIME_OPTIONS.includes(t)) return t;
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (h < 1 || h > 12 || min > 59) return null;
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  const totalMin = h * 60 + min;
  const slotIdx = Math.min(47, Math.max(0, Math.round(totalMin / 30)));
  return EVENT_TIME_OPTIONS[slotIdx];
}
