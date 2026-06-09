import { getTokensSync } from '@/api/authSession';
import { useAppStore } from '@/store/appStore';

export type InitialRoute = '/entry' | '/(tabs)/explore';

/**
 * Cold-start destination after splash + auth hydration.
 * - Logged-in users (valid persisted session) → main tabs.
 * - Guests who already chose Browse first → main tabs.
 * - Everyone else (first launch, or after logout) → entry carousel.
 */
export function resolveInitialRoute(): InitialRoute {
  const { isAuthenticated, hasCompletedOnboarding } = useAppStore.getState();
  const hasAccessToken = Boolean(getTokensSync()?.accessToken);

  if (isAuthenticated && hasAccessToken) {
    return '/(tabs)/explore';
  }
  if (hasCompletedOnboarding) {
    return '/(tabs)/explore';
  }
  return '/entry';
}

/** True when the entry/onboarding carousel should not be shown. */
export function shouldSkipEntryScreen(): boolean {
  return resolveInitialRoute() === '/(tabs)/explore';
}
