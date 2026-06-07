import type { BusinessProfileResponse } from '@/api/types';

type ProfileFlags = Pick<BusinessProfileResponse, 'status' | 'requiresReApproval' | 'previouslyApproved'>;

export function isReapprovalPending(profile: ProfileFlags): boolean {
  return profile.status === 'PENDING_REVIEW' && profile.requiresReApproval === true;
}

export function isFirstTimePending(profile: ProfileFlags): boolean {
  return profile.status === 'PENDING_REVIEW' && profile.requiresReApproval !== true;
}

export function isRejectedProfileUpdate(profile: ProfileFlags): boolean {
  return profile.status === 'REJECTED' && profile.previouslyApproved === true;
}
