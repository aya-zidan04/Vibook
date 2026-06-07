import type { EventItem } from '@/types';

const cache = new Map<string, EventItem[]>();

export function curatedCacheKey(cityId: string): string {
  return cityId.trim() || '__all__';
}

export function getCachedCuratedEvents(cityId: string): EventItem[] {
  return cache.get(curatedCacheKey(cityId)) ?? [];
}

export function setCachedCuratedEvents(cityId: string, events: EventItem[]): void {
  cache.set(curatedCacheKey(cityId), events);
}
