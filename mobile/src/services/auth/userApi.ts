import type { UserResponseDto } from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export type PatchProfilePayload = {
  firstName?: string;
  lastName?: string;
  nameAr?: string | null;
  phone?: string;
  preferredLanguage?: 'EN' | 'AR';
  cityId?: number | null;
  unsetCity?: boolean;
  avatarUrl?: string | null;
};

export const userApi = {
  async getMe(): Promise<UserResponseDto> {
    return apiRequest<UserResponseDto>('/api/v1/me', { auth: true });
  },

  async patchMe(body: PatchProfilePayload): Promise<UserResponseDto> {
    return apiRequest<UserResponseDto>('/api/v1/me', { method: 'PATCH', body, auth: true });
  },
};
