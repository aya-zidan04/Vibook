import type { FavoriteResponseDto, FavoritesListResponseDto } from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const meFavoritesApi = {
  async list(): Promise<FavoritesListResponseDto> {
    return apiRequest<FavoritesListResponseDto>('/api/v1/me/favorites', { auth: true });
  },

  async put(type: string, refId: number): Promise<FavoriteResponseDto> {
    return apiRequest<FavoriteResponseDto>(`/api/v1/me/favorites/${type}/${refId}`, {
      method: 'PUT',
      auth: true,
    });
  },

  async remove(type: string, refId: number): Promise<void> {
    await apiRequest<void>(`/api/v1/me/favorites/${type}/${refId}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};
