import { apiFetch } from '@/api/http';
import type { AuthResponse, MessageResponse, TokenRefreshResponse, UserResponse } from '@/api/types';

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    auth: false,
    method: 'POST',
    jsonBody: { email: email.trim(), password },
  });
}

export async function registerRequest(body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    auth: false,
    method: 'POST',
    jsonBody: body,
  });
}

export async function logoutRequest(refreshToken: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/auth/logout', {
    auth: false,
    method: 'POST',
    jsonBody: { refreshToken },
    skipRefresh: true,
  });
}

export async function refreshRequest(refreshToken: string): Promise<TokenRefreshResponse> {
  return apiFetch<TokenRefreshResponse>('/auth/refresh', {
    auth: false,
    method: 'POST',
    jsonBody: { refreshToken },
    skipRefresh: true,
  });
}

export async function fetchCurrentUser(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/users/me');
}
