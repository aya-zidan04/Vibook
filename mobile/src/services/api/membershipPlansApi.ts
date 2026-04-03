import type { MembershipPlansListResponseDto } from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const membershipPlansApi = {
  async list(): Promise<MembershipPlansListResponseDto> {
    return apiRequest<MembershipPlansListResponseDto>('/api/v1/membership/plans');
  },
};
