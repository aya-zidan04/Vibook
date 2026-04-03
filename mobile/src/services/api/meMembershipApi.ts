import type { MeMembershipResponseDto, SubscribeMembershipRequestDto } from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const meMembershipApi = {
  async get(): Promise<MeMembershipResponseDto> {
    return apiRequest<MeMembershipResponseDto>('/api/v1/me/membership', { auth: true });
  },

  async subscribe(body: SubscribeMembershipRequestDto): Promise<MeMembershipResponseDto> {
    return apiRequest<MeMembershipResponseDto>('/api/v1/me/membership/subscribe', {
      method: 'POST',
      body,
      auth: true,
    });
  },
};
