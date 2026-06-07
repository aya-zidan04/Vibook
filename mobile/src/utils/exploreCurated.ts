import type { EventItem } from '@/types';

const CURATED_HERO_LIMIT = 4;

/**
 * Picks hero carousel items from the governorate-wide pool (never category-filtered).
 * Prefers top-rated events; otherwise falls back to newest. Always returns at least one
 * when the pool is non-empty.
 */
export function pickCuratedHeroEvents(events: EventItem[], limit = CURATED_HERO_LIMIT): EventItem[] {
  if (!events.length) return [];

  const rated = [...events]
    .filter((e) => e.reviewCount > 0 && e.rating > 0)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  const pool = rated.length > 0 ? rated : events;
  return pool.slice(0, Math.max(1, Math.min(limit, pool.length)));
}
