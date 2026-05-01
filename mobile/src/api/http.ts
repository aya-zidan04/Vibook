import { getApiBaseUrl } from '@/api/env';
import type { ErrorResponse } from '@/api/types';
import {
  clearTokens,
  getTokensSync,
  loadTokensFromStorage,
  updateAccessToken,
} from '@/api/authSession';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message);
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    let refreshToken = getTokensSync()?.refreshToken;
    if (!refreshToken) {
      const loaded = await loadTokensFromStorage();
      refreshToken = loaded?.refreshToken;
    }
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { token: string; tokenType: string };
      await updateAccessToken(data.token, data.tokenType ?? 'Bearer');
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export type ApiRequestOptions = RequestInit & {
  /** When true (default for most calls), send Bearer access token if present. */
  auth?: boolean;
  /** JSON-serializable body; ignored if `body` is set in init. */
  jsonBody?: unknown;
  /** If true, skip auto-refresh on 401 (used for refresh/logout). */
  skipRefresh?: boolean;
};

function authHeader(): Record<string, string> {
  const t = getTokensSync();
  if (!t?.accessToken) return {};
  const scheme = t.tokenType || 'Bearer';
  return { Authorization: `${scheme} ${t.accessToken}` };
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    auth = true,
    jsonBody,
    skipRefresh = false,
    headers: hdrs,
    method = 'GET',
    body: explicitBody,
    ...rest
  } = options;
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers = new Headers(hdrs);
  const body =
    explicitBody !== undefined ? explicitBody : jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined;
  if (jsonBody !== undefined && explicitBody === undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (auth && !getTokensSync()?.accessToken) {
    await loadTokensFromStorage();
  }
  if (auth) {
    const h = authHeader();
    if (h.Authorization) headers.set('Authorization', h.Authorization);
  }

  const exec = () =>
    fetch(url, {
      ...rest,
      method,
      body,
      headers,
    });

  let res = await exec();
  if (res.status === 401 && auth && !skipRefresh) {
    const ok = await refreshAccessToken();
    if (ok) {
      const h2 = new Headers(hdrs);
      if (jsonBody !== undefined && explicitBody === undefined) {
        h2.set('Content-Type', 'application/json');
      }
      if (!h2.has('Accept')) h2.set('Accept', 'application/json');
      const ah = authHeader();
      if (ah.Authorization) h2.set('Authorization', ah.Authorization);
      res = await fetch(url, { ...rest, method, body, headers: h2 });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let parsed: unknown = text;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const msg =
      typeof parsed === 'object' && parsed !== null && 'message' in parsed
        ? String((parsed as ErrorResponse).message)
        : res.statusText;
    if (res.status === 401 && auth) {
      await clearTokens();
    }
    throw new ApiError(res.status, parsed, msg || 'Request failed');
  }

  return parsed as T;
}
