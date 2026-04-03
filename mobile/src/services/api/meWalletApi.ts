import type { WalletResponseDto } from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const meWalletApi = {
  async get(): Promise<WalletResponseDto> {
    return apiRequest<WalletResponseDto>('/api/v1/me/wallet', { auth: true });
  },
};
