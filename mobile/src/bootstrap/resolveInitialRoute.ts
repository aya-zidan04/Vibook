import { getTokensSync } from '@/api/authSession';

export type InitialRoute = '/entry' | '/(tabs)/explore';

/**
 * Cold-start destination after splash + auth hydration.
 * - Logged-in users (persisted access token) → main tabs.
 * - Guests without a token (first launch, or after logout) → entry carousel.
 */
export function resolveInitialRoute(): InitialRoute {
  const hasAccessToken = Boolean(getTokensSync()?.accessToken);

  if (hasAccessToken) {
    return '/(tabs)/explore';
  }
  return '/entry';
}

/** True when the entry/onboarding carousel should not be shown. */
export function shouldSkipEntryScreen(): boolean {
  return Boolean(getTokensSync()?.accessToken);
}
