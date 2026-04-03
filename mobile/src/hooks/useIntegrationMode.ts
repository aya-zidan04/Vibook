import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';

/**
 * Mock-only app: no HTTP API. Flags mirror the old shape so screens keep simple conditionals.
 *
 * - **liveAccount** is always false (nothing remote to hydrate).
 * - **authenticated** still reflects mock login state.
 */
export type IntegrationMode = {
  api: boolean;
  authenticated: boolean;
  liveAccount: boolean;
  mockOnly: boolean;
  guestWithApi: boolean;
};

export function useIntegrationMode(): IntegrationMode {
  const authenticated = useAppStore((s) => s.isAuthenticated);
  return useMemo(
    () => ({
      api: false,
      authenticated,
      liveAccount: false,
      mockOnly: true,
      guestWithApi: false,
    }),
    [authenticated],
  );
}
