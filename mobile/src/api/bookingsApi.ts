import { apiFetch } from '@/api/http';
import type { BookingResponse } from '@/api/types';

export async function createBooking(body: {
  eventId: number;
  timeSlotId?: number | null;
  guestsCount: number;
  note?: string | null;
}): Promise<BookingResponse> {
  return apiFetch<BookingResponse>('/bookings', {
    method: 'POST',
    jsonBody: body,
  });
}

export async function listMyBookings(): Promise<BookingResponse[]> {
  return apiFetch<BookingResponse[]>('/bookings/me');
}

export async function getMyBooking(id: number): Promise<BookingResponse> {
  return apiFetch<BookingResponse>(`/bookings/me/${id}`);
}

export async function cancelMyBooking(id: number, reason?: string | null): Promise<BookingResponse> {
  const hasReason = reason != null && String(reason).trim().length > 0;
  return apiFetch<BookingResponse>(`/bookings/me/${id}/cancel`, {
    method: 'PATCH',
    ...(hasReason ? { jsonBody: { reason: String(reason).trim() } } : {}),
  });
}
