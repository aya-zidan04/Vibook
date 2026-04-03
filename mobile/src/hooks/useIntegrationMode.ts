import { useMemo } from 'react';
import { isApiConfigured } from '@/config/api';
import { useAppStore } from '@/store/appStore';

/**
 * Single place for API vs mock vs guest semantics (see `mobile/INTEGRATION.md`).
 *
 * - **mockOnly** — `EXPO_PUBLIC_API_BASE_URL` unset: catalog + account UX use bundled mocks.
 * - **guestWithApi** — URL set but user not signed in: public catalog APIs where wired; `/me/*` screens show sign-in prompts.
 * - **liveAccount** — URL set and signed in: authenticated API for bookings, wallet, favorites sync, etc.
 */
export type IntegrationMode = {
  api: boolean;
  authenticated: boolean;
  liveAccount: boolean;
  mockOnly: boolean;
  guestWithApi: boolean;
};

export function useIntegrationMode(): IntegrationMode {
  const api = isApiConfigured();
  const authenticated = useAppStore((s) => s.isAuthenticated);
  return useMemo(
    () => ({
      api,
      authenticated,
      liveAccount: api && authenticated,
      mockOnly: !api,
      guestWithApi: api && !authenticated,
    }),
    [api, authenticated],
  );
}
