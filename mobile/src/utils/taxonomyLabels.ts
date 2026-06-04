import { translate } from '@/i18n/resolve';
import type { AppLocale } from '@/store/localeStore';

/** Backend category slug → `taxonomy.categories.{slug}` */
export function localizedCategoryLabel(
  slug: string | undefined,
  locale: AppLocale,
  apiFallbackName: string,
): string {
  const key = slug ? `taxonomy.categories.${slug}` : '';
  return (key ? translate(locale, key) : undefined) ?? apiFallbackName;
}

/** Backend subcategory slug → `taxonomy.subcategories.{slug}` */
export function localizedSubcategoryLabel(
  slug: string | undefined,
  locale: AppLocale,
  apiFallbackName: string,
): string {
  const key = slug ? `taxonomy.subcategories.${slug}` : '';
  return (key ? translate(locale, key) : undefined) ?? apiFallbackName;
}

/** Pick localized category/subcategory label for active UI locale. */
export function pickCategoryLabel(
  slug: string | undefined,
  locale: AppLocale,
  labelEn: string,
  labelAr: string,
): string {
  return locale === 'ar'
    ? localizedCategoryLabel(slug, 'ar', labelAr)
    : localizedCategoryLabel(slug, 'en', labelEn);
}

export function pickSubcategoryLabel(
  slug: string | undefined,
  locale: AppLocale,
  name: string,
  nameAr: string,
): string {
  return locale === 'ar'
    ? localizedSubcategoryLabel(slug, 'ar', nameAr)
    : localizedSubcategoryLabel(slug, 'en', name);
}
