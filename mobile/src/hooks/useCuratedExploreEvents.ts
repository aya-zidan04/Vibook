import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCuratedExploreEvents } from '@/api/eventsApi';
import { businessEventSummaryToEventItem } from '@/services/api/eventMap';
import type { EventItem } from '@/types';
import { getCachedCuratedEvents, setCachedCuratedEvents } from '@/utils/exploreCuratedCache';

/**
 * Governorate-wide featured events for Explore "Curated for you".
 * Depends only on selectedCityId — never category / subcategory.
 */
export function useCuratedExploreEvents(selectedCityId: string): {
  events: EventItem[];
  loading: boolean;
  reload: () => void;
} {
  const cityKey = selectedCityId;
  const requestIdRef = useRef(0);

  const [events, setEvents] = useState<EventItem[]>(() => getCachedCuratedEvents(cityKey));
  const [loading, setLoading] = useState(() => getCachedCuratedEvents(cityKey).length === 0);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      const cached = getCachedCuratedEvents(cityKey);
      const silent = opts?.silent ?? cached.length > 0;
      const requestId = ++requestIdRef.current;

      if (!silent) {
        setLoading(true);
      }

      try {
        const gid = Number(cityKey);
        const rows = await fetchCuratedExploreEvents(Number.isFinite(gid) ? gid : undefined);
        if (requestId !== requestIdRef.current) return;

        const mapped = rows.map(businessEventSummaryToEventItem);
        setCachedCuratedEvents(cityKey, mapped);
        setEvents(mapped);
      } catch (err) {
        if (__DEV__) {
          console.warn('[explore-curated] fetch failed; keeping cached events', err);
        }
        // Never clear events — keep cache / last good list.
        const fallback = getCachedCuratedEvents(cityKey);
        if (fallback.length > 0) {
          setEvents(fallback);
        }
      } finally {
        if (requestId === requestIdRef.current && !silent) {
          setLoading(false);
        }
      }
    },
    [cityKey],
  );

  // City change only — not category.
  useEffect(() => {
    const cached = getCachedCuratedEvents(cityKey);
    setEvents(cached);
    setLoading(cached.length === 0);
    void load({ silent: cached.length > 0 });
  }, [cityKey, load]);

  // Background refresh when screen refocuses; does not reset list or show hero spinner.
  useFocusEffect(
    useCallback(() => {
      void load({ silent: true });
      return undefined;
    }, [load]),
  );

  return { events, loading, reload: () => load({ silent: false }) };
}
