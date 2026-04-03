import type { BusinessLeadResponseDto, CreateBusinessLeadRequestDto } from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const businessLeadsApi = {
  async submit(body: CreateBusinessLeadRequestDto): Promise<BusinessLeadResponseDto> {
    return apiRequest<BusinessLeadResponseDto>('/api/v1/business/leads', {
      method: 'POST',
      body,
    });
  },
};
