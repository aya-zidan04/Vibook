import type { AppLocale } from '@/store/localeStore';
import { mapApiErrorForLocale } from '@/utils/mapApiError';

/** @deprecated Prefer {@link mapApiError} / {@link mapApiErrorForLocale} in UI code. */
export function formatApiErrorMessage(err: unknown, locale: AppLocale = 'en'): string {
  return mapApiErrorForLocale(err, locale);
}

export { createTranslator, mapApiError, mapApiErrorForLocale } from '@/utils/mapApiError';
export type { TranslateFn } from '@/utils/mapApiError';
