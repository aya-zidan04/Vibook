import { listMyFavorites } from '@/api/favoritesApi';
import { getTokensSync } from '@/api/authSession';
import { useFavoritesStore } from '@/store/favoritesStore';

/** Loads server favorites into the local store (for heart state on cards and PDP). */
export async function syncFavoritesFromServer(): Promise<void> {
  if (!getTokensSync()?.accessToken) return;
  try {
    const page = await listMyFavorites(0, 100);
    useFavoritesStore.getState().mergeFavoriteEventIds(page.content.map((row) => row.id));
  } catch {
    /* offline or unauthorized */
  }
}
