import { ApiError } from '@/api/http';
import type { ErrorResponse } from '@/api/types';
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

/** Prefer backend `message` / first `fieldErrors` entry when present. */
export function extractApiErrorDetail(err: unknown): string | null {
  if (!(err instanceof ApiError)) {
    if (err instanceof Error && err.message && !err.message.startsWith('http_')) {
      return err.message;
    }
    return null;
  }

  if (err.message && !err.message.startsWith('http_')) {
    const generic = new Set(['Validation failed', 'Bad request', 'Forbidden', 'Not found', 'Unauthorized']);
    if (!generic.has(err.message)) {
      return err.message;
    }
  }

  const body = err.body;
  if (typeof body !== 'object' || body === null) {
    return err.message && !err.message.startsWith('http_') ? err.message : null;
  }

  const er = body as ErrorResponse;
  if (er.fieldErrors) {
    const values = Object.values(er.fieldErrors).filter(Boolean);
    if (values.length > 0) {
      return values.join(' ');
    }
  }
  if (er.message?.trim()) {
    return er.message.trim();
  }
  return null;
}

/**
 * Map API/network failures to user-facing copy. Uses backend detail when available.
 */
export function mapApiError(err: unknown, t: TranslateFn): string {
  if (isNetworkError(err)) {
    return t('errors.network');
  }

  const detail = extractApiErrorDetail(err);
  if (detail) {
    return detail;
  }

  if (err instanceof ApiError) {
    const { status } = err;
    if (status === 401) return t('errors.unauthorized');
    if (status === 403) return t('errors.forbidden');
    if (status === 404) return t('errors.notFound');
    if (status === 409) return t('errors.conflict');
    if (status === 422 || status === 400) return t('errors.validation');
    if (status === 408) return t('errors.timeout');
    if (status >= 500) {
      return detail ?? t('errors.server');
    }
    if (status >= 400) return t('errors.request');
    return t('common.error');
  }

  return t('common.error');
}

export function mapApiErrorForLocale(err: unknown, locale: AppLocale): string {
  return mapApiError(err, createTranslator(locale));
}

export type EventSaveStep = 'create' | 'upload' | 'update' | 'deletePhoto';

export function isEventSaveStepError(err: unknown): err is Error & { saveStep: EventSaveStep } {
  return (
    err instanceof Error &&
    'saveStep' in err &&
    typeof (err as Error & { saveStep?: unknown }).saveStep === 'string'
  );
}

export async function runEventSaveStep<T>(step: EventSaveStep, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (__DEV__) {
      console.warn(`[event-save] step=${step} failed`, e);
      if (e instanceof ApiError) {
        console.warn(`[event-save] status=${e.status} body=`, e.body);
      }
    }
    const wrapped = e instanceof Error ? e : new Error(String(e));
    Object.assign(wrapped, { saveStep: step });
    throw wrapped;
  }
}

export function mapEventSaveError(err: unknown, t: TranslateFn): string {
  const detail = mapApiError(err, t);
  if (isEventSaveStepError(err)) {
    const key = `businessHub.eventSaveFailed${err.saveStep.charAt(0).toUpperCase()}${err.saveStep.slice(1)}`;
    const template = t(key);
    if (template !== key) {
      return template.replace('{detail}', detail);
    }
  }
  return detail;
}
