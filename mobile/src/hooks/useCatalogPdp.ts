import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const mockEvent = id ? getEventById(id) : undefined;
    const mockTiers = mockEvent ? getTiersForEvent(mockEvent.id) : [];
    setEvent(mockEvent);
    setTiers(mockTiers);
    setLoading(false);
  }, [id]);

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

export function useFlightPdp(id: string | undefined): {
  flight: Flight | undefined;
  loading: boolean;
} {
  const [flight, setFlight] = useState<Flight | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFlight(id ? getFlightById(id) : undefined);
    setLoading(false);
  }, [id]);

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

  useEffect(() => {
    const mockOrg = id ? getOrganizerById(id) : undefined;
    const mockEvents = mockOrg ? MOCK_EVENTS.filter((e) => e.organizerId === mockOrg.id) : [];
    setOrganizer(mockOrg);
    setEvents(mockEvents);
    setLoading(false);
  }, [id]);

  return { organizer, events, loading };
}
