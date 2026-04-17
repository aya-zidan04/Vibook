import { useEffect, useState } from 'react';
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

export function useEventPdp(id: string | undefined): {
  event: EventItem | undefined;
  tiers: TicketTier[];
  loading: boolean;
} {
  const hubEvents = useBusinessHubStore((s) => s.events);
  const [event, setEvent] = useState<EventItem | undefined>();
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setEvent(undefined);
      setTiers([]);
      setLoading(false);
      return;
    }
    const ev = getEventById(id);
    setEvent(ev);
    if (!ev) {
      setTiers([]);
      setLoading(false);
      return;
    }
    const fromMock = MOCK_EVENTS.some((e) => e.id === id);
    if (fromMock) {
      setTiers(getTiersForEvent(ev.id));
    } else {
      const biz = hubEvents.find((e) => e.id === id && !e.hidden);
      if (biz) {
        setTiers([
          {
            id: `${biz.id}-tier-general`,
            eventId: biz.id,
            name: 'General admission',
            price: biz.priceJod,
            currency: biz.currency || 'JOD',
            benefits: [],
          },
        ]);
      } else {
        setTiers([]);
      }
    }
    setLoading(false);
  }, [id, hubEvents]);

  return { event, tiers, loading };
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
