import { apiFetch, ApiError } from '@/api/http';
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

/** Sets status to {@code PENDING_REVIEW} when the profile is {@code DRAFT} or {@code REJECTED}. */
export async function submitMyBusinessProfileForReview(): Promise<BusinessProfileResponseDto> {
  return apiFetch<BusinessProfileResponseDto>('/business-profile/me/submit', {
    method: 'PATCH',
  });
}
