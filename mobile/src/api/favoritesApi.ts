import { apiFetch } from '@/api/http';
import type { FavoriteEventResponse, FavoriteResponse, FavoriteStatusResponse, MessageResponse, PageResponse } from '@/api/types';

export async function listMyFavorites(page = 0, size = 20): Promise<PageResponse<FavoriteEventResponse>> {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  return apiFetch<PageResponse<FavoriteEventResponse>>(`/favorites?${q.toString()}`);
}

export async function addFavorite(eventId: number): Promise<FavoriteResponse> {
  return apiFetch<FavoriteResponse>(`/favorites/${eventId}`, { method: 'POST' });
}

export async function removeFavorite(eventId: number): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/favorites/${eventId}`, { method: 'DELETE' });
}

export async function favoriteStatus(eventId: number): Promise<FavoriteStatusResponse> {
  return apiFetch<FavoriteStatusResponse>(`/favorites/${eventId}/status`);
}
