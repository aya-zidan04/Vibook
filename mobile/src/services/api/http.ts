import { getApiBaseUrl, isApiConfigured } from '@/config/api';
import type { ApiErrorBody, AuthResponseDto } from '@/services/api/types';
import { getAccessToken, getRefreshToken, saveTokens } from '@/services/auth/tokenStorage';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const m = (body as ApiErrorBody).message;
    if (typeof m === 'string' && m.length > 0) return m;
  }
  return fallback;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const rt = await getRefreshToken();
      if (!rt || !isApiConfigured()) return null;
      const base = getApiBaseUrl()!;
      const res = await fetch(`${base}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as AuthResponseDto;
      await saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresInSeconds: data.expiresInSeconds,
      });
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  /** Skip refresh-on-401 (e.g. refresh endpoint itself). */
  skipRefresh?: boolean;
};

/**
 * JSON request to the Vibook API. Throws {@link ApiRequestError} on non-2xx.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiRequestError('API base URL is not configured', 0);
  }
  const base = getApiBaseUrl()!;
  const { method = 'GET', body, auth = false, skipRefresh = false } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const at = await getAccessToken();
    if (at) headers.Authorization = `Bearer ${at}`;
  }

  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const init: RequestInit = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);

  let res = await fetch(url, init);

  if (res.status === 401 && auth && !skipRefresh) {
    const newAt = await refreshAccessToken();
    if (newAt) {
      headers.Authorization = `Bearer ${newAt}`;
      res = await fetch(url, { ...init, headers });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }
  const payload = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = messageFromBody(payload, res.statusText || 'Request failed');
    throw new ApiRequestError(msg, res.status, payload as ApiErrorBody | undefined);
  }
  return payload as T;
}
