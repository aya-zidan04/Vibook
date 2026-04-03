import type {
  EventDto,
  ExperienceDto,
  FlightDto,
  HotelDto,
  OfferDto,
  OrganizerDto,
  PackageDto,
  RestaurantDto,
  TicketTierDto,
} from '@/types/catalogDtos';
import type {
  BadgeTone,
  EventItem,
  ExperienceItem,
  Flight,
  Hotel,
  Organizer,
  Restaurant,
  TicketTier,
  TravelPackage,
} from '@/types';

const BADGE_TONES: BadgeTone[] = ['popular', 'limited', 'new', 'soldFast', 'exclusive'];

export function parseCatalogBadge(raw: string | null | undefined): BadgeTone | undefined {
  if (raw == null || raw === '') return undefined;
  const n = raw.trim().toLowerCase();
  return BADGE_TONES.includes(n as BadgeTone) ? (n as BadgeTone) : undefined;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v !== '') return Number(v) || fallback;
  return fallback;
}

/** `selectedCityId` from app store: numeric string → filter catalog; mock ids (e.g. `gov-amman`) → all cities. */
export function parseCityIdForCatalog(selectedCityId: string): number | undefined {
  if (/^\d+$/.test(selectedCityId)) return Number(selectedCityId);
  return undefined;
}

/**
 * True when the id is a backend catalog numeric id (digits only).
 * Mock routes use opaque ids (`e1`, `r1`, `gov-amman`, …).
 */
export function isNumericCatalogId(id: string | undefined | null): boolean {
  if (id == null || id === '') return false;
  return /^\d+$/.test(id.trim());
}

/** Route param is numeric → call catalog detail APIs; otherwise use mock ids (e.g. `e1`, `r1`). */
export function parseCatalogNumericId(id: string | undefined): number | null {
  if (!isNumericCatalogId(id ?? null)) return null;
  return Number(id);
}

export function eventDtoToEventItem(dto: EventDto): EventItem {
  return {
    id: String(dto.id),
    title: dto.title,
    categoryId: String(dto.categoryId),
    cityId: String(dto.cityId),
    organizerId: String(dto.organizerId),
    imageUrl: dto.imageUrl,
    gallery: Array.isArray(dto.gallery) ? dto.gallery : [],
    startAt: String(dto.startAt ?? ''),
    endAt: String(dto.endAt ?? ''),
    venueName: dto.venueName,
    address: dto.address,
    description: dto.description,
    priceFrom: num(dto.priceFrom),
    currency: dto.currency,
    rating: num(dto.rating),
    reviewCount: typeof dto.reviewCount === 'number' ? dto.reviewCount : 0,
    badge: parseCatalogBadge(dto.badge ?? undefined),
  };
}

export function experienceDurationHours(dto: ExperienceDto): number {
  return num(dto.durationHours, 0);
}

export type CatalogRouter = { push: (href: string) => void };

export function navigateForOffer(router: CatalogRouter, offer: OfferDto): void {
  const type = (offer.targetType ?? '').toUpperCase();
  const id = offer.targetId;
  if (id == null) {
    router.push('/search');
    return;
  }
  switch (type) {
    case 'EVENT':
      router.push(`/event/${id}`);
      return;
    case 'RESTAURANT':
      router.push(`/restaurant/${id}`);
      return;
    case 'EXPERIENCE':
      router.push(`/experience/${id}`);
      return;
    case 'PACKAGE':
      router.push(`/package/${id}`);
      return;
    case 'HOTEL':
    case 'STAY':
      router.push(`/stay/${id}`);
      return;
    case 'FLIGHT':
      router.push(`/flight/${id}`);
      return;
    default:
      router.push('/search');
  }
}

export function offerSuggestsFlights(offer: OfferDto): boolean {
  const t = `${offer.title} ${offer.subtitle}`.toLowerCase();
  return t.includes('flight') || t.includes('طيران') || t.includes('رحل');
}

export function tierDtoToTicketTier(dto: TicketTierDto): TicketTier {
  return {
    id: String(dto.id),
    eventId: String(dto.eventId),
    name: dto.name,
    price: num(dto.price),
    currency: dto.currency,
    benefits: Array.isArray(dto.benefits) ? dto.benefits : [],
    remaining: dto.remaining ?? undefined,
  };
}

function clampPriceLevel(n: number): 1 | 2 | 3 | 4 {
  const x = Math.round(Number(n));
  if (x < 1) return 1;
  if (x > 4) return 4;
  return x as 1 | 2 | 3 | 4;
}

function normalizeFlightCabin(raw: string): Flight['cabin'] {
  const c = raw.trim().toLowerCase();
  if (c === 'business') return 'business';
  if (c === 'first' || c === 'first_class') return 'first';
  return 'economy';
}

export function restaurantDtoToRestaurant(dto: RestaurantDto): Restaurant {
  return {
    id: String(dto.id),
    name: dto.name,
    cuisineIds: (dto.cuisineIds ?? []).map(String),
    cityId: String(dto.cityId),
    imageUrl: dto.imageUrl,
    priceLevel: clampPriceLevel(dto.priceLevel),
    rating: num(dto.rating),
    reviewCount: typeof dto.reviewCount === 'number' ? dto.reviewCount : 0,
    badge: parseCatalogBadge(dto.badge ?? undefined),
  };
}

export function experienceDtoToExperienceItem(dto: ExperienceDto): ExperienceItem {
  return {
    id: String(dto.id),
    title: dto.title,
    categoryId: String(dto.categoryId),
    cityId: String(dto.cityId),
    imageUrl: dto.imageUrl,
    durationHours: experienceDurationHours(dto),
    priceFrom: num(dto.priceFrom),
    currency: dto.currency,
    rating: num(dto.rating),
    badge: parseCatalogBadge(dto.badge ?? undefined),
  };
}

export function hotelDtoToHotel(dto: HotelDto): Hotel {
  return {
    id: String(dto.id),
    name: dto.name,
    cityId: String(dto.cityId),
    imageUrl: dto.imageUrl,
    stars: typeof dto.stars === 'number' ? dto.stars : 0,
    priceFrom: num(dto.priceFrom),
    currency: dto.currency,
    rating: num(dto.rating),
    badge: parseCatalogBadge(dto.badge ?? undefined),
  };
}

export function flightDtoToFlight(dto: FlightDto): Flight {
  return {
    id: String(dto.id),
    airline: dto.airline,
    from: dto.from,
    to: dto.to,
    departAt: String(dto.departAt ?? ''),
    arriveAt: String(dto.arriveAt ?? ''),
    durationMin: typeof dto.durationMin === 'number' ? dto.durationMin : 0,
    stops: typeof dto.stops === 'number' ? dto.stops : 0,
    price: num(dto.price),
    currency: dto.currency,
    cabin: normalizeFlightCabin(dto.cabin ?? 'economy'),
  };
}

export function packageDtoToTravelPackage(dto: PackageDto): TravelPackage {
  return {
    id: String(dto.id),
    title: dto.title,
    cityIds: (dto.cityIds ?? []).map(String),
    imageUrl: dto.imageUrl,
    nights: typeof dto.nights === 'number' ? dto.nights : 0,
    priceFrom: num(dto.priceFrom),
    currency: dto.currency,
    badge: parseCatalogBadge(dto.badge ?? undefined),
  };
}

export function organizerDtoToOrganizer(dto: OrganizerDto): Organizer {
  return {
    id: String(dto.id),
    name: dto.name,
    logoUrl: dto.logoUrl,
    coverUrl: dto.coverUrl,
    verified: Boolean(dto.verified),
    about: dto.about ?? '',
    rating: num(dto.rating),
    reviewCount: typeof dto.reviewCount === 'number' ? dto.reviewCount : 0,
  };
}
