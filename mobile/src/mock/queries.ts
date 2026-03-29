import type {
  EventItem,
  ExperienceItem,
  Flight,
  Hotel,
  Organizer,
  Restaurant,
  TravelPackage,
} from '@/types';
import { MOCK_CITIES } from './cities';
import { MOCK_EVENTS } from './events';
import { MOCK_EXPERIENCES } from './experiences';
import { MOCK_FLIGHTS } from './flights';
import { MOCK_HOTELS } from './hotels';
import { MOCK_ORGANIZERS } from './organizers';
import { MOCK_PACKAGES } from './packages';
import { MOCK_RESTAURANTS } from './restaurants';
import { MOCK_TICKET_TIERS } from './ticketTiers';

export function getEventById(id: string): EventItem | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return MOCK_RESTAURANTS.find((r) => r.id === id);
}

export function getHotelById(id: string): Hotel | undefined {
  return MOCK_HOTELS.find((h) => h.id === id);
}

export function getExperienceById(id: string): ExperienceItem | undefined {
  return MOCK_EXPERIENCES.find((x) => x.id === id);
}

export function getPackageById(id: string): TravelPackage | undefined {
  return MOCK_PACKAGES.find((p) => p.id === id);
}

export function getFlightById(id: string): Flight | undefined {
  return MOCK_FLIGHTS.find((f) => f.id === id);
}

export function getOrganizerById(id: string): Organizer | undefined {
  return MOCK_ORGANIZERS.find((o) => o.id === id);
}

export function getCityName(cityId: string): string {
  return MOCK_CITIES.find((c) => c.id === cityId)?.nameEn ?? '';
}

export function getTiersForEvent(eventId: string) {
  return MOCK_TICKET_TIERS.filter((t) => t.eventId === eventId);
}
