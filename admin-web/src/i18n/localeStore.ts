export type AdminLocale = 'en' | 'ar';

const STORAGE_KEY = 'vibook_admin_locale';

let locale: AdminLocale = 'en';
const listeners = new Set<() => void>();

function readStored(): AdminLocale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

locale = readStored();

export function getAdminLocale(): AdminLocale {
  return locale;
}

export function setAdminLocale(next: AdminLocale) {
  locale = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  applyDocumentLocale(next);
  listeners.forEach((l) => l());
}

export function subscribeAdminLocale(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyDocumentLocale(loc: AdminLocale) {
  const root = document.documentElement;
  root.lang = loc;
  root.dir = loc === 'ar' ? 'rtl' : 'ltr';
}

applyDocumentLocale(locale);
