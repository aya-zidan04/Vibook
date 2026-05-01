import { apiFetch } from '@/api/http';
import type { BusinessEventResponse, BusinessEventSummaryResponse, EventRatingResponse, PageResponse } from '@/api/types';

export type EventSearchParams = {
  page?: number;
  size?: number;
  governorateId?: number;
  categoryId?: number;
  subcategoryId?: number;
  date?: string;
  keyword?: string;
  minPrice?: string;
  maxPrice?: string;
  includeHidden?: boolean;
};

function toQuery(p: EventSearchParams): string {
  const q = new URLSearchParams();
  if (p.page != null) q.set('page', String(p.page));
  if (p.size != null) q.set('size', String(p.size));
  if (p.governorateId != null) q.set('governorateId', String(p.governorateId));
  if (p.categoryId != null) q.set('categoryId', String(p.categoryId));
  if (p.subcategoryId != null) q.set('subcategoryId', String(p.subcategoryId));
  if (p.date) q.set('date', p.date);
  if (p.keyword) q.set('keyword', p.keyword);
  if (p.minPrice) q.set('minPrice', p.minPrice);
  if (p.maxPrice) q.set('maxPrice', p.maxPrice);
  if (p.includeHidden) q.set('includeHidden', 'true');
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function searchEvents(params: EventSearchParams = {}): Promise<PageResponse<BusinessEventSummaryResponse>> {
  return apiFetch<PageResponse<BusinessEventSummaryResponse>>(`/events${toQuery(params)}`);
}

export async function getEventById(eventId: number): Promise<BusinessEventResponse> {
  return apiFetch<BusinessEventResponse>(`/events/${eventId}`);
}

export async function rateEvent(eventId: number, rating: number): Promise<EventRatingResponse> {
  return apiFetch<EventRatingResponse>(`/events/${eventId}/rate`, {
    method: 'POST',
    jsonBody: { rating },
  });
}
