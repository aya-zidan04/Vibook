import type { PageResponseDto } from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

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

/** JSON uses `from` / `to` (see backend {@code @JsonProperty}). */
export type FlightDto = {
  id: number;
  airline: string;
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  durationMin: number;
  stops: number;
  price: number;
  currency: string;
  cabin: string;
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

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '') continue;
    q.set(k, String(v));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

/** Read-only catalog — use from screens as you replace mocks. */
export const catalogReadApi = {
  async listEvents(params: {
    page?: number;
    size?: number;
    cityId?: number;
    categoryId?: number;
    organizerId?: number;
    q?: string;
    sort?: string;
  }): Promise<PageResponseDto<EventDto>> {
    const qs = buildQuery({
      page: params.page,
      size: params.size,
      cityId: params.cityId,
      categoryId: params.categoryId,
      organizerId: params.organizerId,
      q: params.q,
      sort: params.sort,
    });
    return apiRequest<PageResponseDto<EventDto>>(`/api/v1/events${qs}`);
  },

  async getEvent(id: number): Promise<EventDto> {
    return apiRequest<EventDto>(`/api/v1/events/${id}`);
  },

  async listEventTiers(eventId: number): Promise<TicketTierDto[]> {
    return apiRequest<TicketTierDto[]>(`/api/v1/events/${eventId}/tiers`);
  },

  async getRestaurant(id: number): Promise<RestaurantDto> {
    return apiRequest<RestaurantDto>(`/api/v1/restaurants/${id}`);
  },

  async getExperience(id: number): Promise<ExperienceDto> {
    return apiRequest<ExperienceDto>(`/api/v1/experiences/${id}`);
  },

  async getHotel(id: number): Promise<HotelDto> {
    return apiRequest<HotelDto>(`/api/v1/hotels/${id}`);
  },

  async getFlight(id: number): Promise<FlightDto> {
    return apiRequest<FlightDto>(`/api/v1/flights/${id}`);
  },

  async getPackage(id: number): Promise<PackageDto> {
    return apiRequest<PackageDto>(`/api/v1/packages/${id}`);
  },

  async getOrganizer(id: number): Promise<OrganizerDto> {
    return apiRequest<OrganizerDto>(`/api/v1/organizers/${id}`);
  },

  async listOffers(params: {
    page?: number;
    size?: number;
    q?: string;
    sort?: string;
  }): Promise<PageResponseDto<OfferDto>> {
    const qs = buildQuery({
      page: params.page,
      size: params.size,
      q: params.q,
      sort: params.sort,
    });
    return apiRequest<PageResponseDto<OfferDto>>(`/api/v1/offers${qs}`);
  },

  async listExperiences(params: {
    page?: number;
    size?: number;
    cityId?: number;
    categoryId?: number;
    q?: string;
    sort?: string;
  }): Promise<PageResponseDto<ExperienceDto>> {
    const qs = buildQuery({
      page: params.page,
      size: params.size,
      cityId: params.cityId,
      categoryId: params.categoryId,
      q: params.q,
      sort: params.sort,
    });
    return apiRequest<PageResponseDto<ExperienceDto>>(`/api/v1/experiences${qs}`);
  },

  async listPackages(params: {
    page?: number;
    size?: number;
    cityId?: number;
    q?: string;
    sort?: string;
  }): Promise<PageResponseDto<PackageDto>> {
    const qs = buildQuery({
      page: params.page,
      size: params.size,
      cityId: params.cityId,
      q: params.q,
      sort: params.sort,
    });
    return apiRequest<PageResponseDto<PackageDto>>(`/api/v1/packages${qs}`);
  },
};
