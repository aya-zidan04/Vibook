import { apiFetch } from '@/api/http';
import type { GovernorateResponse } from '@/api/types';

export async function listActiveGovernorates(): Promise<GovernorateResponse[]> {
  return apiFetch<GovernorateResponse[]>('/governorates/active', { auth: false });
}
