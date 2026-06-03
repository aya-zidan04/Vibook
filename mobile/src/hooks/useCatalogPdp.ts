import { useCallback, useEffect, useState } from 'react';
import type { BusinessEventResponse } from '@/api/types';
import { getEventById as getEventByIdFromApi } from '@/api/eventsApi';
import { businessEventDetailToEventItem, tiersFromBusinessEvent } from '@/services/api/eventMap';
import type { EventItem, ExperienceItem, Hotel, Organizer, Restaurant, TicketTier, TravelPackage } from '@/types';

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

export function useOrganizerForEvent(_event: EventItem | undefined): Organizer | undefined {
  return undefined;
}

export function useRestaurantPdp(id: string | undefined): {
  restaurant: Restaurant | undefined;
  loading: boolean;
} {
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRestaurant(undefined);
    setLoading(false);
  }, [id]);

  return { restaurant, loading };
}

export function useExperiencePdp(id: string | undefined): {
  experience: ExperienceItem | undefined;
  loading: boolean;
} {
  const [experience, setExperience] = useState<ExperienceItem | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setExperience(undefined);
    setLoading(false);
  }, [id]);

  return { experience, loading };
}

export function useHotelPdp(id: string | undefined): { hotel: Hotel | undefined; loading: boolean } {
  const [hotel, setHotel] = useState<Hotel | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHotel(undefined);
    setLoading(false);
  }, [id]);

  return { hotel, loading };
}

export function usePackagePdp(id: string | undefined): {
  pkg: TravelPackage | undefined;
  loading: boolean;
} {
  const [pkg, setPkg] = useState<TravelPackage | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPkg(undefined);
    setLoading(false);
  }, [id]);

  return { pkg, loading };
}

export function useOrganizerPdp(id: string | undefined): {
  organizer: Organizer | undefined;
  events: EventItem[];
  loading: boolean;
} {
  const [organizer, setOrganizer] = useState<Organizer | undefined>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrganizer(undefined);
    setEvents([]);
    setLoading(false);
  }, [id]);

  return { organizer, events, loading };
}
