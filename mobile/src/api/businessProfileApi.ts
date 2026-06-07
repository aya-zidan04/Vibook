import { apiFetch, ApiError } from '@/api/http';
import { apiUploadMultipart } from '@/api/multipartUpload';
import type { BusinessProfileResponseDto, BusinessProfileUpsertPayload } from '@/api/types';

/**
 * Loads the authenticated user's business profile, or null if none exists (404).
 */
export async function fetchMyBusinessProfile(): Promise<BusinessProfileResponseDto | null> {
  try {
    return await apiFetch<BusinessProfileResponseDto>('/business-profile/me', { method: 'GET' });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function upsertMyBusinessProfile(
  payload: BusinessProfileUpsertPayload,
): Promise<BusinessProfileResponseDto> {
  return apiFetch<BusinessProfileResponseDto>('/business-profile/me', {
    method: 'PUT',
    jsonBody: payload,
  });
}

/** Sets status to {@code PENDING_REVIEW} when the profile is {@code DRAFT} or {@code REJECTED}. Approved-profile edits go to {@code PENDING_REVIEW} automatically on save. */
export async function submitMyBusinessProfileForReview(): Promise<BusinessProfileResponseDto> {
  return apiFetch<BusinessProfileResponseDto>('/business-profile/me/submit', {
    method: 'PATCH',
  });
}

export async function uploadMyBusinessLogo(localUri: string): Promise<BusinessProfileResponseDto> {
  return apiUploadMultipart<BusinessProfileResponseDto>('/business-profile/me/logo', 'image', localUri);
}

export async function uploadMyBusinessBanner(localUri: string): Promise<BusinessProfileResponseDto> {
  return apiUploadMultipart<BusinessProfileResponseDto>('/business-profile/me/banner', 'image', localUri);
}

export async function deleteMyBusinessLogo(): Promise<BusinessProfileResponseDto> {
  return apiFetch<BusinessProfileResponseDto>('/business-profile/me/logo', { method: 'DELETE' });
}

export async function deleteMyBusinessBanner(): Promise<BusinessProfileResponseDto> {
  return apiFetch<BusinessProfileResponseDto>('/business-profile/me/banner', { method: 'DELETE' });
}
