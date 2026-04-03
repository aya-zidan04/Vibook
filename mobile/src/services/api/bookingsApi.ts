import type {
  BookingListResponseDto,
  BookingResponseDto,
  CreateBookingRequestDto,
} from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const bookingsApi = {
  async create(body: CreateBookingRequestDto): Promise<BookingResponseDto> {
    return apiRequest<BookingResponseDto>('/api/v1/bookings', {
      method: 'POST',
      body,
      auth: true,
    });
  },

  async listMine(): Promise<BookingListResponseDto> {
    return apiRequest<BookingListResponseDto>('/api/v1/me/bookings', { auth: true });
  },

  async getMine(id: string): Promise<BookingResponseDto> {
    return apiRequest<BookingResponseDto>(`/api/v1/me/bookings/${id}`, { auth: true });
  },

  async cancel(id: string): Promise<BookingResponseDto> {
    return apiRequest<BookingResponseDto>(`/api/v1/bookings/${id}/cancel`, {
      method: 'POST',
      auth: true,
    });
  },
};
