import { apiFetch } from '@/api/http';
import type { UserResponse } from '@/api/types';

export async function updateUser(
  id: number,
  body: { firstName: string; lastName: string; phone: string },
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/users/${id}`, {
    method: 'PUT',
    jsonBody: body,
  });
}
