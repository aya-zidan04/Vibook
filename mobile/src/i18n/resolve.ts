import { translations } from '@/i18n/dictionary';
import type { AppLocale } from '@/store/localeStore';

export function getNestedString(obj: Record<string, unknown>, path: string): string | undefined {
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

/** Locale string with English fallback (same rules as `useTranslation`). */
export function translate(locale: AppLocale, path: string): string | undefined {
  const tree = translations[locale] as unknown as Record<string, unknown>;
  const fallback = translations.en as unknown as Record<string, unknown>;
  return getNestedString(tree, path) ?? getNestedString(fallback, path);
}
