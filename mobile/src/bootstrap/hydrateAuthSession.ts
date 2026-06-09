import { fetchCurrentUser } from '@/api/authApi';
import { ApiError } from '@/api/http';
import { clearTokens, getTokensSync, loadTokensFromStorage } from '@/api/authSession';
import { syncFavoritesFromServer } from '@/services/favorites/syncFavoritesFromServer';
import { useAppStore } from '@/store/appStore';
import { useSessionStore } from '@/store/sessionStore';

/** Restore access token and profile after cold start (requires EXPO_PUBLIC_API_URL). */
export async function hydrateAuthSession(): Promise<void> {
  try {
    await loadTokensFromStorage();
  } catch {
    return;
  }
  const t = getTokensSync();
  if (!t?.accessToken) {
    useAppStore.getState().setAuthenticated(false);
    useAppStore.getState().setGuest(true);
    useSessionStore.getState().clearSession();
    return;
  }
  try {
    const me = await fetchCurrentUser();
    useSessionStore.getState().setSessionFromAuthResponse(me);
    useAppStore.getState().setAuthenticated(true);
    useAppStore.getState().setGuest(false);
    await syncFavoritesFromServer();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      await clearTokens();
      useSessionStore.getState().clearSession();
      useAppStore.getState().setAuthenticated(false);
      useAppStore.getState().setGuest(true);
    } else {
      useAppStore.getState().setAuthenticated(true);
      useAppStore.getState().setGuest(false);
    }
  }
}
