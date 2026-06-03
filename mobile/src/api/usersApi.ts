import { apiFetch } from '@/api/http';
import { apiUploadMultipart } from '@/api/multipartUpload';
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

export async function uploadMyProfileImage(localUri: string): Promise<UserResponse> {
  return apiUploadMultipart<UserResponse>('/users/me/profile-image', 'image', localUri);
}

export async function deleteMyProfileImage(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/users/me/profile-image', { method: 'DELETE' });
}
