/** Split display name for PATCH /me (first token vs remainder). */
export function nameToFirstLast(full: string): { firstName: string; lastName?: string } {
  const t = full.trim();
  const i = t.indexOf(' ');
  if (i === -1) return { firstName: t };
  const firstName = t.slice(0, i).trim();
  const lastName = t.slice(i + 1).trim();
  return lastName.length > 0 ? { firstName, lastName } : { firstName: t };
}

/** Backend expects E.164-style phone (e.g. +9627xxxxxxxx). */
export function normalizePhoneForApi(phone: string): string {
  const t = phone.trim().replace(/\s/g, '');
  if (t.startsWith('+')) return t;
  const digits = t.replace(/\D/g, '');
  if (digits.length === 9) return `+962${digits}`;
  if (digits.startsWith('962') && digits.length >= 12) return `+${digits}`;
  return `+${digits}`;
}
