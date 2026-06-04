import type { Category } from '@/types';
import type { EventItem } from '@/types';
import { pickCategoryLabel } from '@/utils/taxonomyLabels';

/** Category labels from live catalog — clickable as search shortcuts. */
export function trendingFromCategories(categories: Category[], locale: 'en' | 'ar', limit = 6): string[] {
  return categories
    .slice(0, limit)
    .map((c) => pickCategoryLabel(c.slug, locale, c.labelEn, c.labelAr));
}

function isMostlyLatin(text: string): boolean {
  return /^[\u0000-\u024F\s#.&'/-]+$/.test(text.trim());
}

/** Distinct subcategory / venue labels from recent API events. */
export function suggestedTagsFromEvents(events: EventItem[], locale: 'en' | 'ar', limit = 8): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of events) {
    const label = (e.venueName || e.categoryId || '').trim();
    if (!label || label === 'api' || label === 'unknown' || label === 'event') continue;
    if (locale === 'ar' && isMostlyLatin(label)) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= limit) break;
  }
  return out;
}
