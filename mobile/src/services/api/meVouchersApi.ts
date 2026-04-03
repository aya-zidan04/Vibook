import type {
  RedeemVoucherRequestDto,
  VoucherResponseDto,
  VouchersListResponseDto,
} from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const meVouchersApi = {
  async list(): Promise<VouchersListResponseDto> {
    return apiRequest<VouchersListResponseDto>('/api/v1/me/vouchers', { auth: true });
  },

  async redeem(body: RedeemVoucherRequestDto): Promise<VoucherResponseDto> {
    return apiRequest<VoucherResponseDto>('/api/v1/me/vouchers/redeem', {
      method: 'POST',
      body,
      auth: true,
    });
  },
};
