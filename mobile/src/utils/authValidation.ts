export function isValidEmail(value: string): boolean {
  const t = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

/** At least 8 chars, one letter, one number (case-sensitive allowed). */
export function isValidSignupPassword(value: string): boolean {
  if (value.length < 8) return false;
  return /[a-zA-Z]/.test(value) && /\d/.test(value);
}

/** Jordan mobile without country code: 9 digits starting with 7. */
export function isValidJordanLocalPhone(digits: string): boolean {
  return /^7\d{8}$/.test(digits.replace(/\s/g, ''));
}

export function canSubmitLogin(email: string, password: string): boolean {
  return isValidEmail(email) && isValidSignupPassword(password);
}
