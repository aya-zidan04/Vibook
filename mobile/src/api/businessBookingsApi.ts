import { apiFetch } from '@/api/http';
import type { BookingResponse, BookingStatusApi } from '@/api/types';

export type BookingStatusUpdatePayload = {
  status: BookingStatusApi;
};

export async function listMyBusinessBookings(): Promise<BookingResponse[]> {
  return apiFetch<BookingResponse[]>('/business/bookings', { method: 'GET' });
}

export async function updateMyBusinessBookingStatus(
  id: number,
  payload: BookingStatusUpdatePayload,
): Promise<BookingResponse> {
  return apiFetch<BookingResponse>(`/business/bookings/${id}/status`, {
    method: 'PATCH',
    jsonBody: payload,
  });
}
