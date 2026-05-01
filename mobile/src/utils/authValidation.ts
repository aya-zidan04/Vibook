export function isValidEmail(value: string): boolean {
  const t = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

/** Backend RegisterRequest: 8–64 chars, at least one uppercase letter and one digit. */
export function isValidSignupPassword(value: string): boolean {
  if (value.length < 8 || value.length > 64) return false;
  return /[A-Z]/.test(value) && /\d/.test(value);
}

/** Jordan mobile without country code: 9 digits starting with 7. */
export function isValidJordanLocalPhone(digits: string): boolean {
  return /^7\d{8}$/.test(digits.replace(/\s/g, ''));
}

/** Local 9 digits from stored E.164 (+962…) or legacy values (last 9 digits fallback). */
export function jordanLocalDigitsFromStored(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('962') && d.length >= 12) return d.slice(3, 12);
  if (/^7\d{8}$/.test(d)) return d;
  if (d.length >= 9) return d.slice(-9);
  return '';
}

export function canSubmitLogin(email: string, password: string): boolean {
  return isValidEmail(email) && isValidSignupPassword(password);
}
