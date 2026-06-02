import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchEvents, type EventSearchParams } from '@/api/eventsApi';
import { businessEventSummaryToEventItem } from '@/services/api/eventMap';
import type { SearchFilters } from '@/store/searchStore';
import type { EventItem } from '@/types';

export function buildEventSearchParams(
  keyword: string,
  filters: SearchFilters,
  governorateId?: number,
): EventSearchParams {
  const params: EventSearchParams = {
    page: 0,
    size: 40,
  };

  const q = keyword.trim();
  if (q.length >= 1) params.keyword = q;

  if (governorateId != null && Number.isFinite(governorateId)) {
    params.governorateId = governorateId;
  }

  const subcategoryId = filters.subcategoryIds[0];
  if (subcategoryId) {
    const n = Number(subcategoryId);
    if (Number.isFinite(n)) params.subcategoryId = n;
  } else {
    const categoryId = filters.categoryIds[0];
    if (categoryId) {
      const n = Number(categoryId);
      if (Number.isFinite(n)) params.categoryId = n;
    }
  }

  return params;
}

const DINING_HINTS = ['restaurant', 'dining', 'cafe', 'food', 'مطعم', 'مقهى'];

export function filterEventsBySegment(
  events: EventItem[],
  segment: 'all' | 'events' | 'restaurants',
): EventItem[] {
  if (segment === 'all' || segment === 'events') return events;

  return events.filter((e) => {
    const hay = `${e.title} ${e.venueName} ${e.categoryId}`.toLowerCase();
    return DINING_HINTS.some((h) => hay.includes(h.toLowerCase()));
  });
}

export function useEventSearch(
  keyword: string,
  filters: SearchFilters,
  governorateId: number | undefined,
  enabled: boolean,
  debounceMs = 320,
): {
  events: EventItem[];
  loading: boolean;
  error: unknown | null;
  retry: () => void;
} {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [tick, setTick] = useState(0);
  const requestId = useRef(0);

  const params = useMemo(
    () => buildEventSearchParams(keyword, filters, governorateId),
    [keyword, filters, governorateId],
  );

  const retry = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    const id = ++requestId.current;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      void (async () => {
        try {
          const page = await searchEvents(params);
          if (requestId.current !== id) return;
          setEvents(page.content.map(businessEventSummaryToEventItem));
        } catch (e) {
          if (requestId.current !== id) return;
          setEvents([]);
          setError(e);
        } finally {
          if (requestId.current === id) setLoading(false);
        }
      })();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [enabled, params, debounceMs, tick]);

  return { events, loading, error, retry };
}
