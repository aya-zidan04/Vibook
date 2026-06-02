/**
 * Admin appearance — sets `document.documentElement.dataset.theme`.
 * `dark` | `light` are explicit; `system` follows OS via CSS media queries.
 */

export type AdminThemeMode = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'vibook_admin_theme';

let theme: AdminThemeMode = 'dark';
const listeners = new Set<() => void>();

function readStored(): AdminThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'system' || v === 'dark') return v;
  } catch {
    /* ignore */
  }
  return 'dark';
}

theme = readStored();

export function getAdminTheme(): AdminThemeMode {
  return theme;
}

export function subscribeAdminTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Apply theme to `<html data-theme="…">` (omit attribute when `system`). */
export function applyAdminTheme(mode: AdminThemeMode = theme) {
  theme = mode;
  const root = document.documentElement;
  if (mode === 'system') {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = mode;
  }
}

export function setAdminTheme(mode: AdminThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  applyAdminTheme(mode);
  listeners.forEach((l) => l());
}

applyAdminTheme(theme);
