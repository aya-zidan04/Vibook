import { useCallback, useEffect, useState } from 'react';
import type { BusinessEventResponse } from '@/api/types';
import { getEventById as getEventByIdFromApi } from '@/api/eventsApi';
import {
  getEventById,
  getExperienceById,
  getHotelById,
  getOrganizerById,
  getPackageById,
  getRestaurantById,
  getTiersForEvent,
  MOCK_EVENTS,
} from '@/services/mock';
import { businessEventDetailToEventItem, tiersFromBusinessEvent } from '@/services/api/eventMap';
import { useAppStore } from '@/store/appStore';
import { useBusinessHubStore } from '@/store/businessHubStore';
import type {
  EventItem,
  ExperienceItem,
  Hotel,
  Organizer,
  Restaurant,
  TicketTier,
  TravelPackage,
} from '@/types';
import {
  businessTicketOptionsToTicketTiers,
  syntheticTierFromEventItem,
} from '@/utils/businessEventTickets';

export function useEventPdp(id: string | undefined): {
  event: EventItem | undefined;
  tiers: TicketTier[];
  loading: boolean;
  /** Present for numeric/API-backed events; use for ratings and bookings. */
  apiDetail: BusinessEventResponse | null;
  refetchApiDetail: () => void;
} {
  const hubEvents = useBusinessHubStore((s) => s.events);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [event, setEvent] = useState<EventItem | undefined>();
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const isNumericCatalog = /^\d+$/.test(id);

    if (isNumericCatalog) {
      if (!isAuthenticated) {
        setEvent(undefined);
        setTiers([]);
        setApiDetail(null);
        setLoading(false);
        return () => {
          cancelled = true;
        };
      }
      setLoading(true);
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
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    setApiDetail(null);
    const ev = getEventById(id);
    setEvent(ev);
    if (!ev) {
      setTiers([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    const fromMock = MOCK_EVENTS.some((e) => e.id === id);
    if (fromMock) {
      const explicit = getTiersForEvent(ev.id);
      setTiers(explicit.length > 0 ? explicit : [syntheticTierFromEventItem(ev)]);
    } else {
      const biz = hubEvents.find((e) => e.id === id && !e.hidden);
      if (biz && biz.ticketOptions?.length) {
        setTiers(businessTicketOptionsToTicketTiers(biz.id, biz.ticketOptions));
      } else {
        setTiers([]);
      }
    }
    setLoading(false);
    return () => {
      cancelled = true;
    };
  }, [id, hubEvents, isAuthenticated, refreshTick]);

  return { event, tiers, loading, apiDetail, refetchApiDetail };
}

export function useOrganizerForEvent(event: EventItem | undefined): Organizer | undefined {
  const [organizer, setOrganizer] = useState<Organizer | undefined>();

  useEffect(() => {
    if (!event) {
      setOrganizer(undefined);
      return;
    }
    setOrganizer(getOrganizerById(event.organizerId));
  }, [event?.organizerId, event?.id]);

  return organizer;
}

export function useRestaurantPdp(id: string | undefined): {
  restaurant: Restaurant | undefined;
  loading: boolean;
} {
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRestaurant(id ? getRestaurantById(id) : undefined);
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
    setExperience(id ? getExperienceById(id) : undefined);
    setLoading(false);
  }, [id]);

  return { experience, loading };
}

export function useHotelPdp(id: string | undefined): { hotel: Hotel | undefined; loading: boolean } {
  const [hotel, setHotel] = useState<Hotel | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHotel(id ? getHotelById(id) : undefined);
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
    setPkg(id ? getPackageById(id) : undefined);
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
    const mockOrg = id ? getOrganizerById(id) : undefined;
    const mockEvents = mockOrg ? MOCK_EVENTS.filter((e) => e.organizerId === mockOrg.id) : [];
    setOrganizer(mockOrg);
    setEvents(mockEvents);
    setLoading(false);
  }, [id]);

  return { organizer, events, loading };
}
