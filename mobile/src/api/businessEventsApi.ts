import { apiFetch } from '@/api/http';
import { apiUploadMultipart } from '@/api/multipartUpload';
import type { BusinessEventResponse, BusinessEventSummaryResponse } from '@/api/types';

export type BusinessEventUpsertPayload = {
  title: string;
  subcategoryId: number;
  description: string;
  eventDate: string;
  timeSlots: string[];
  governorateId: number;
  googleMapsUrl: string | null;
  priceJod: string;
  currency: string;
  capacityGuests: number;
  hidden: boolean;
  photoUrls: string[] | null;
};

export async function listMyBusinessEvents(): Promise<BusinessEventSummaryResponse[]> {
  return apiFetch<BusinessEventSummaryResponse[]>('/business/events', { method: 'GET' });
}

export async function getMyBusinessEvent(id: number): Promise<BusinessEventResponse> {
  return apiFetch<BusinessEventResponse>(`/business/events/${id}`, { method: 'GET' });
}

export async function createMyBusinessEvent(payload: BusinessEventUpsertPayload): Promise<BusinessEventResponse> {
  return apiFetch<BusinessEventResponse>('/business/events', {
    method: 'POST',
    jsonBody: payload,
  });
}

export async function updateMyBusinessEvent(
  id: number,
  payload: BusinessEventUpsertPayload,
): Promise<BusinessEventResponse> {
  return apiFetch<BusinessEventResponse>(`/business/events/${id}`, {
    method: 'PUT',
    jsonBody: payload,
  });
}

export async function deleteMyBusinessEvent(id: number): Promise<void> {
  await apiFetch<void>(`/business/events/${id}`, { method: 'DELETE' });
}

export async function hideMyBusinessEvent(id: number): Promise<BusinessEventResponse> {
  return apiFetch<BusinessEventResponse>(`/business/events/${id}/hide`, { method: 'PATCH' });
}

export async function unhideMyBusinessEvent(id: number): Promise<BusinessEventResponse> {
  return apiFetch<BusinessEventResponse>(`/business/events/${id}/unhide`, { method: 'PATCH' });
}

export async function uploadMyBusinessEventPhoto(
  eventId: number,
  localUri: string,
): Promise<BusinessEventResponse> {
  return apiUploadMultipart<BusinessEventResponse>(`/business/events/${eventId}/photos`, 'image', localUri);
}

export async function deleteMyBusinessEventPhoto(
  eventId: number,
  photoId: number,
): Promise<BusinessEventResponse> {
  return apiFetch<BusinessEventResponse>(`/business/events/${eventId}/photos/${photoId}`, {
    method: 'DELETE',
  });
}
