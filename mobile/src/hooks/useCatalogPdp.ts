import { useCallback, useEffect, useState } from 'react';
import type { BusinessEventResponse } from '@/api/types';
import { getEventById as getEventByIdFromApi } from '@/api/eventsApi';
import { businessEventDetailToEventItem, tiersFromBusinessEvent } from '@/services/api/eventMap';
import type { EventItem, TicketTier } from '@/types';

export function useEventPdp(id: string | undefined): {
  event: EventItem | undefined;
  tiers: TicketTier[];
  loading: boolean;
  error: boolean;
  /** Present for numeric/API-backed events; use for ratings and bookings. */
  apiDetail: BusinessEventResponse | null;
  refetchApiDetail: () => void;
} {
  const [event, setEvent] = useState<EventItem | undefined>();
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [apiDetail, setApiDetail] = useState<BusinessEventResponse | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const refetchApiDetail = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setEvent(undefined);
      setTiers([]);
      setApiDetail(null);
      setError(false);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const isNumericCatalog = /^\d+$/.test(id);
    if (!isNumericCatalog) {
      setApiDetail(null);
      setEvent(undefined);
      setTiers([]);
      setError(false);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(false);
    void (async () => {
      try {
        const raw = await getEventByIdFromApi(Number(id));
        if (cancelled) return;
        setApiDetail(raw);
        setEvent(businessEventDetailToEventItem(raw));
        setTiers(tiersFromBusinessEvent(raw));
      } catch {
        if (!cancelled) {
          setApiDetail(null);
          setEvent(undefined);
          setTiers([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, refreshTick]);

  return { event, tiers, loading, error, apiDetail, refetchApiDetail };
}
