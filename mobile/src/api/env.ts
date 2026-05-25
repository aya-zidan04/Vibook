let loggedApiUrl = false;

/**
 * API base URL from env — must include scheme, host, port, and path prefix `/api/v1`.
 * Example: `http://192.168.1.5:8080/api/v1` (use your laptop's LAN IP for physical devices).
 * Do not use `localhost` on a real phone; the device cannot reach your computer that way.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!loggedApiUrl && typeof __DEV__ !== 'undefined' && __DEV__) {
    loggedApiUrl = true;
    console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
  }
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }
  throw new Error(
    'Missing API base URL: set EXPO_PUBLIC_API_URL in mobile/.env (e.g. http://YOUR_LAN_IP:8080/api/v1).',
  );
}

/**
 * Absolute URL for a path returned by the API (e.g. `/api/v1/files/...`).
 * {@link getApiBaseUrl} already ends with `/api/v1`, so `/api/v1` is stripped from relative paths.
 */
export function resolveBackendMediaUrl(pathOrUrl: string | null | undefined): string | null {
  if (pathOrUrl == null || pathOrUrl === '') return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getApiBaseUrl();
  let path = pathOrUrl.trim();
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.startsWith('/api/v1')) {
    path = path.slice('/api/v1'.length);
    if (!path.startsWith('/')) path = `/${path}`;
  }
  return `${base}${path}`;
}
