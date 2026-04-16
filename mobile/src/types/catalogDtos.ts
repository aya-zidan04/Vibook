/**
 * Catalog payload shapes previously shared with the backend API.
 * Kept for mappers in {@link services/catalog/mapCatalog}.
 */

export type EventDto = {
  id: number;
  title: string;
  categoryId: number;
  cityId: number;
  organizerId: number;
  imageUrl: string;
  gallery: string[];
  startAt: string;
  endAt: string;
  venueName: string;
  address: string;
  description: string;
  priceFrom: number;
  currency: string;
  rating: number;
  reviewCount: number;
  badge?: string | null;
};

export type OfferDto = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  discountPercent: number | null;
  endsAt: string;
  targetType: string | null;
  targetId: number | null;
};

export type ExperienceDto = {
  id: number;
  title: string;
  categoryId: number;
  cityId: number;
  imageUrl: string;
  durationHours: number;
  priceFrom: number;
  currency: string;
  rating: number;
  badge?: string | null;
};

export type PackageDto = {
  id: number;
  title: string;
  cityIds: number[];
  imageUrl: string;
  nights: number;
  priceFrom: number;
  currency: string;
  badge?: string | null;
};

export type TicketTierDto = {
  id: number;
  eventId: number;
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  remaining: number | null;
};

export type RestaurantDto = {
  id: number;
  name: string;
  cuisineIds: number[];
  cityId: number;
  imageUrl: string;
  priceLevel: number;
  rating: number;
  reviewCount: number;
  badge?: string | null;
};

export type HotelDto = {
  id: number;
  name: string;
  cityId: number;
  imageUrl: string;
  stars: number;
  priceFrom: number;
  currency: string;
  rating: number;
  badge?: string | null;
};

export type OrganizerDto = {
  id: number;
  name: string;
  logoUrl: string;
  coverUrl: string;
  verified: boolean;
  about: string;
  rating: number;
  reviewCount: number;
};
