import { getApiBaseUrl, isApiConfigured } from '@/config/api';
import type { AuthResponseDto } from '@/services/api/types';
import { ApiRequestError } from '@/services/api/http';
import { apiRequest } from '@/services/api/http';
import { saveTokens } from '@/services/auth/tokenStorage';

async function postPublicJson<T>(path: string, body: unknown): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiRequestError('API base URL is not configured', 0);
  }
  const base = getApiBaseUrl()!;
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: string }).message)
        : res.statusText;
    throw new ApiRequestError(msg || 'Request failed', res.status, payload ?? undefined);
  }
  return payload as T;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponseDto> {
    return postPublicJson<AuthResponseDto>('/api/v1/auth/login', { email: email.trim(), password });
  },

  async register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    preferredLanguage?: 'EN' | 'AR';
  }): Promise<AuthResponseDto> {
    return postPublicJson<AuthResponseDto>('/api/v1/auth/register', payload);
  },

  async persistSession(auth: AuthResponseDto): Promise<void> {
    await saveTokens({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      expiresInSeconds: auth.expiresInSeconds,
    });
  },

  /** Best-effort; clears local session even if the call fails. */
  async logoutRemote(): Promise<void> {
    try {
      await apiRequest<void>('/api/v1/auth/logout', { method: 'POST', auth: true });
    } catch {
      /* ignore */
    }
  },
};
