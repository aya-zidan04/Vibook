/**
 * Backend base URL for the Vibook API (no trailing slash).
 *
 * Set `EXPO_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8080` or LAN IP for a device).
 * When unset: {@link isApiConfigured} is false — catalog PDPs, explore, and account tabs use **mock data**
 * and local flows (see `mobile/INTEGRATION.md`).
 *
 * When set: public catalog/reference endpoints are used where wired; `/me/*` and mutations require
 * sign-in (`useIntegrationMode().liveAccount`).
 */
export function getApiBaseUrl(): string | null {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, '') : null;
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl() != null;
}
