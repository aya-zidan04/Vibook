import { apiFetch } from '@/api/http';
import { apiUploadMultipart } from '@/api/multipartUpload';
import {
  traceEventSaveError,
  traceEventSaveRequest,
  traceEventSaveResponse,
  type EventSaveTraceStep,
} from '@/api/eventSaveTrace';
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
  const path = `/business/events/${id}`;
  return tracedEventCall('get', 'GET', path, undefined, () =>
    apiFetch<BusinessEventResponse>(path, { method: 'GET' }),
  );
}

async function tracedEventCall<T>(
  step: EventSaveTraceStep,
  method: string,
  path: string,
  payload: unknown | undefined,
  call: () => Promise<T>,
): Promise<T> {
  traceEventSaveRequest(step, method, path, payload);
  try {
    const result = await call();
    traceEventSaveResponse(step, 200, result);
    return result;
  } catch (e) {
    traceEventSaveError(step, e);
    throw e;
  }
}

export async function createMyBusinessEvent(payload: BusinessEventUpsertPayload): Promise<BusinessEventResponse> {
  return tracedEventCall('create', 'POST', '/business/events', payload, () =>
    apiFetch<BusinessEventResponse>('/business/events', {
      method: 'POST',
      jsonBody: payload,
    }),
  );
}

export async function updateMyBusinessEvent(
  id: number,
  payload: BusinessEventUpsertPayload,
): Promise<BusinessEventResponse> {
  const path = `/business/events/${id}`;
  return tracedEventCall('update', 'PUT', path, payload, () =>
    apiFetch<BusinessEventResponse>(path, {
      method: 'PUT',
      jsonBody: payload,
    }),
  );
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
  const path = `/business/events/${eventId}/photos`;
  traceEventSaveRequest('upload', 'POST', path, { image: localUri });
  try {
    const result = await apiUploadMultipart<BusinessEventResponse>(path, 'image', localUri);
    traceEventSaveResponse('upload', 200, result);
    return result;
  } catch (e) {
    traceEventSaveError('upload', e);
    throw e;
  }
}

export async function deleteMyBusinessEventPhoto(
  eventId: number,
  photoId: number,
): Promise<BusinessEventResponse> {
  const path = `/business/events/${eventId}/photos/${photoId}`;
  return tracedEventCall('deletePhoto', 'DELETE', path, undefined, () =>
    apiFetch<BusinessEventResponse>(path, {
      method: 'DELETE',
    }),
  );
}
