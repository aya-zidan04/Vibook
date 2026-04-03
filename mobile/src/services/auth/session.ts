import { getApiBaseUrl, isApiConfigured } from '@/config/api';
import type { AuthResponseDto } from '@/services/api/types';
import { meRatingsApi } from '@/services/api/meRatingsApi';
import { authApi } from '@/services/auth/authApi';
import { mapUserResponseToUser } from '@/services/auth/mapUser';
import { clearTokens, getRefreshToken } from '@/services/auth/tokenStorage';
import { useAppStore } from '@/store/appStore';
import { useSessionStore } from '@/store/sessionStore';
import { hydrateFavoritesFromApi } from '@/store/favoritesStore';
import { ratingKey, type RatingVertical, useUserRatingsStore } from '@/store/userRatingsStore';

async function hydrateRatingsFromApi(): Promise<void> {
  try {
    const { ratings } = await meRatingsApi.list();
    const next: Record<string, number> = {};
    for (const r of ratings) {
      next[ratingKey(r.vertical as RatingVertical, String(r.refId))] = r.stars;
    }
    useUserRatingsStore.getState().mergeServerRatings(next);
  } catch {
    /* non-fatal */
  }
}

/** Persist tokens, cache user, mark session authenticated, pull ratings. */
export async function applyAuthResponse(auth: AuthResponseDto): Promise<void> {
  await authApi.persistSession(auth);
  useSessionStore.getState().setServerUser(mapUserResponseToUser(auth.user));
  useAppStore.setState({
    isAuthenticated: true,
    isGuest: false,
    hasCompletedOnboarding: true,
  });
  await hydrateRatingsFromApi();
  await hydrateFavoritesFromApi();
}

/**
 * On cold start: refresh tokens if present; align persisted “logged in” flag with real session.
 */
export async function restoreApiSession(): Promise<void> {
  if (!isApiConfigured()) return;

  const rt = await getRefreshToken();
  if (!rt) {
    useSessionStore.getState().setServerUser(null);
    if (useAppStore.getState().isAuthenticated) {
      useAppStore.setState({ isAuthenticated: false, isGuest: true });
    }
    return;
  }

  try {
    const base = getApiBaseUrl()!;
    const res = await fetch(`${base}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) throw new Error('refresh failed');
    const auth = (await res.json()) as AuthResponseDto;
    await applyAuthResponse(auth);
  } catch {
    await clearTokens();
    useSessionStore.getState().setServerUser(null);
    useAppStore.setState({ isAuthenticated: false, isGuest: true });
  }
}

/** Revoke refresh tokens on the server (best-effort). Local wipe happens in {@link useAppStore.getState().logout}. */
export async function signOutFromApi(): Promise<void> {
  await authApi.logoutRemote();
}
