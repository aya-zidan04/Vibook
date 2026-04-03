import { useEffect, useState } from 'react';
import { isApiConfigured } from '@/config/api';
import { catalogReadApi } from '@/services/api/catalogReadApi';
import {
  eventDtoToEventItem,
  experienceDtoToExperienceItem,
  flightDtoToFlight,
  hotelDtoToHotel,
  organizerDtoToOrganizer,
  packageDtoToTravelPackage,
  parseCatalogNumericId,
  restaurantDtoToRestaurant,
  tierDtoToTicketTier,
} from '@/services/catalog/mapCatalog';
import {
  getEventById,
  getExperienceById,
  getFlightById,
  getHotelById,
  getOrganizerById,
  getPackageById,
  getRestaurantById,
  getTiersForEvent,
  MOCK_EVENTS,
} from '@/services/mock';
import type {
  EventItem,
  ExperienceItem,
  Flight,
  Hotel,
  Organizer,
  Restaurant,
  TicketTier,
  TravelPackage,
} from '@/types';

export function useEventPdp(id: string | undefined): {
  event: EventItem | undefined;
  tiers: TicketTier[];
  loading: boolean;
} {
  const [event, setEvent] = useState<EventItem | undefined>();
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [loading, setLoading] = useState(true);
  const apiMode = isApiConfigured();
  const n = parseCatalogNumericId(id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mockEvent = id ? getEventById(id) : undefined;
      const mockTiers = mockEvent ? getTiersForEvent(mockEvent.id) : [];
      if (!apiMode || n == null) {
        if (!cancelled) {
          setEvent(mockEvent);
          setTiers(mockTiers);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const [dto, tierList] = await Promise.all([
          catalogReadApi.getEvent(n),
          catalogReadApi.listEventTiers(n).catch(() => []),
        ]);
        if (!cancelled) {
          setEvent(eventDtoToEventItem(dto));
          setTiers(tierList.map(tierDtoToTicketTier));
        }
      } catch {
        if (!cancelled) {
          setEvent(mockEvent);
          setTiers(mockTiers);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, n, apiMode]);

  return { event, tiers, loading };
}

export function useOrganizerForEvent(event: EventItem | undefined): Organizer | undefined {
  const [organizer, setOrganizer] = useState<Organizer | undefined>();
  const apiMode = isApiConfigured();
  const oid = event ? parseCatalogNumericId(event.organizerId) : null;

  useEffect(() => {
    if (!event) {
      setOrganizer(undefined);
      return;
    }
    const mock = getOrganizerById(event.organizerId);
    if (!apiMode || oid == null) {
      setOrganizer(mock);
      return;
    }
    let cancelled = false;
    catalogReadApi
      .getOrganizer(oid)
      .then((d) => {
        if (!cancelled) setOrganizer(organizerDtoToOrganizer(d));
      })
      .catch(() => {
        if (!cancelled) setOrganizer(mock);
      });
    return () => {
      cancelled = true;
    };
  }, [event?.organizerId, event?.id, oid, apiMode]);

  return organizer;
}

export function useRestaurantPdp(id: string | undefined): {
  restaurant: Restaurant | undefined;
  loading: boolean;
} {
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>();
  const [loading, setLoading] = useState(true);
  const apiMode = isApiConfigured();
  const n = parseCatalogNumericId(id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mock = id ? getRestaurantById(id) : undefined;
      if (!apiMode || n == null) {
        if (!cancelled) {
          setRestaurant(mock);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const dto = await catalogReadApi.getRestaurant(n);
        if (!cancelled) setRestaurant(restaurantDtoToRestaurant(dto));
      } catch {
        if (!cancelled) setRestaurant(mock);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, n, apiMode]);

  return { restaurant, loading };
}

export function useExperiencePdp(id: string | undefined): {
  experience: ExperienceItem | undefined;
  loading: boolean;
} {
  const [experience, setExperience] = useState<ExperienceItem | undefined>();
  const [loading, setLoading] = useState(true);
  const apiMode = isApiConfigured();
  const n = parseCatalogNumericId(id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mock = id ? getExperienceById(id) : undefined;
      if (!apiMode || n == null) {
        if (!cancelled) {
          setExperience(mock);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const dto = await catalogReadApi.getExperience(n);
        if (!cancelled) setExperience(experienceDtoToExperienceItem(dto));
      } catch {
        if (!cancelled) setExperience(mock);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, n, apiMode]);

  return { experience, loading };
}

export function useHotelPdp(id: string | undefined): { hotel: Hotel | undefined; loading: boolean } {
  const [hotel, setHotel] = useState<Hotel | undefined>();
  const [loading, setLoading] = useState(true);
  const apiMode = isApiConfigured();
  const n = parseCatalogNumericId(id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mock = id ? getHotelById(id) : undefined;
      if (!apiMode || n == null) {
        if (!cancelled) {
          setHotel(mock);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const dto = await catalogReadApi.getHotel(n);
        if (!cancelled) setHotel(hotelDtoToHotel(dto));
      } catch {
        if (!cancelled) setHotel(mock);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, n, apiMode]);

  return { hotel, loading };
}

export function usePackagePdp(id: string | undefined): {
  pkg: TravelPackage | undefined;
  loading: boolean;
} {
  const [pkg, setPkg] = useState<TravelPackage | undefined>();
  const [loading, setLoading] = useState(true);
  const apiMode = isApiConfigured();
  const n = parseCatalogNumericId(id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mock = id ? getPackageById(id) : undefined;
      if (!apiMode || n == null) {
        if (!cancelled) {
          setPkg(mock);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const dto = await catalogReadApi.getPackage(n);
        if (!cancelled) setPkg(packageDtoToTravelPackage(dto));
      } catch {
        if (!cancelled) setPkg(mock);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, n, apiMode]);

  return { pkg, loading };
}

export function useFlightPdp(id: string | undefined): {
  flight: Flight | undefined;
  loading: boolean;
} {
  const [flight, setFlight] = useState<Flight | undefined>();
  const [loading, setLoading] = useState(true);
  const apiMode = isApiConfigured();
  const n = parseCatalogNumericId(id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mock = id ? getFlightById(id) : undefined;
      if (!apiMode || n == null) {
        if (!cancelled) {
          setFlight(mock);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const dto = await catalogReadApi.getFlight(n);
        if (!cancelled) setFlight(flightDtoToFlight(dto));
      } catch {
        if (!cancelled) setFlight(mock);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, n, apiMode]);

  return { flight, loading };
}

export function useOrganizerPdp(id: string | undefined): {
  organizer: Organizer | undefined;
  events: EventItem[];
  loading: boolean;
} {
  const [organizer, setOrganizer] = useState<Organizer | undefined>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const apiMode = isApiConfigured();
  const n = parseCatalogNumericId(id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mockOrg = id ? getOrganizerById(id) : undefined;
      const mockEvents = mockOrg ? MOCK_EVENTS.filter((e) => e.organizerId === mockOrg.id) : [];
      if (!apiMode || n == null) {
        if (!cancelled) {
          setOrganizer(mockOrg);
          setEvents(mockEvents);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const [orgDto, page] = await Promise.all([
          catalogReadApi.getOrganizer(n),
          catalogReadApi.listEvents({ organizerId: n, page: 0, size: 40, sort: 'start_at_asc' }),
        ]);
        if (!cancelled) {
          setOrganizer(organizerDtoToOrganizer(orgDto));
          setEvents(page.content.map(eventDtoToEventItem));
        }
      } catch {
        if (!cancelled) {
          setOrganizer(mockOrg);
          setEvents(mockEvents);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, n, apiMode]);

  return { organizer, events, loading };
}
