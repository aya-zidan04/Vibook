import { ApiError } from '@/api/http';
import { translations } from '@/i18n/dictionary';
import type { AppLocale } from '@/store/localeStore';

export type TranslateFn = (path: string) => string;

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

/** Build a translator for non-React callers (stores, hooks). */
export function createTranslator(locale: AppLocale): TranslateFn {
  return (path: string) => {
    const tree = translations[locale] as unknown as Record<string, unknown>;
    const fallback = translations.en as unknown as Record<string, unknown>;
    return getNested(tree, path) ?? getNested(fallback, path) ?? path;
  };
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) {
    return /fetch|network|failed to fetch|load failed|network request failed/i.test(err.message);
  }
  if (err instanceof Error) {
    return /network|failed to fetch|load failed|network request failed|timeout/i.test(err.message);
  }
  return false;
}

/**
 * Map API/network failures to localized copy. Never returns raw backend English messages.
 */
export function mapApiError(err: unknown, t: TranslateFn): string {
  if (isNetworkError(err)) {
    return t('errors.network');
  }

  if (err instanceof ApiError) {
    const { status } = err;
    if (status === 401) return t('errors.unauthorized');
    if (status === 403) return t('errors.forbidden');
    if (status === 404) return t('errors.notFound');
    if (status === 409) return t('errors.conflict');
    if (status === 422 || status === 400) return t('errors.validation');
    if (status === 408) return t('errors.timeout');
    if (status >= 500) return t('errors.server');
    if (status >= 400) return t('errors.request');
    return t('common.error');
  }

  return t('common.error');
}

export function mapApiErrorForLocale(err: unknown, locale: AppLocale): string {
  return mapApiError(err, createTranslator(locale));
}
