import type { RatingsListResponseDto } from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const meRatingsApi = {
  async list(): Promise<RatingsListResponseDto> {
    return apiRequest<RatingsListResponseDto>('/api/v1/me/ratings', { auth: true });
  },

  async put(vertical: string, refId: number, stars: number | null): Promise<void> {
    await apiRequest<unknown>(`/api/v1/me/ratings/${vertical}/${refId}`, {
      method: 'PUT',
      body: { stars },
      auth: true,
    });
  },
};
