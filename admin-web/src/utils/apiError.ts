import axios from 'axios';
import { ADMIN_ACCESS_DENIED } from '@/auth/authErrors';
import { getAdminLocale } from '@/i18n/localeStore';
import { translations } from '@/i18n/dictionary';

function errText(key: string): string {
  const locale = getAdminLocale();
  const parts = key.split('.');
  let cur: unknown = translations[locale];
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof cur === 'string' ? cur : key;
}

/** User-safe message; logs technical detail in dev console only. */
export function getFriendlyErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    if (import.meta.env.DEV) {
      console.warn('[API]', status, data ?? err.message);
    }
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return errText('errors.network');
    }
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const msg = String((data as { message: string }).message);
      if (msg && msg !== 'undefined') return msg;
    }
    if (status === 403) return errText('errors.forbidden');
    if (status === 404) return errText('errors.notFound');
    if (status === 401) return errText('errors.unauthorized');
    if (status != null && status >= 500) return errText('errors.generic');
    return fallback;
  }
  if (err instanceof Error && err.message) {
    if (import.meta.env.DEV) console.warn(err);
    if (err.message === ADMIN_ACCESS_DENIED) return errText('errors.accessDenied');
    return err.message;
  }
  return fallback;
}
