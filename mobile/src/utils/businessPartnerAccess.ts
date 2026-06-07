import type { BusinessProfileStatusDto } from '@/api/types';

/** Partner may use events/bookings/dashboard tools only when the profile is admin-approved. */
export function canManageBusinessOperations(
  status: BusinessProfileStatusDto | null | undefined,
): boolean {
  return status === 'APPROVED';
}

/** Returning partners (re-approval flow) may open the hub shell and edit their profile. */
export function canAccessPartnerDashboard(
  status: BusinessProfileStatusDto | null | undefined,
  requiresReApproval: boolean,
  previouslyApproved: boolean,
): boolean {
  if (status === 'APPROVED') return true;
  if (status === 'REJECTED' && previouslyApproved) return true;
  return false;
}

export type PartnerGateMessageKey =
  | 'businessHub.gateManagementBlocked'
  | 'businessHub.gateRejectedReapproval';

export function partnerGateMessageKey(
  status: BusinessProfileStatusDto | null | undefined,
  _requiresReApproval: boolean,
  previouslyApproved: boolean,
): PartnerGateMessageKey | null {
  if (canManageBusinessOperations(status)) return null;
  if (status === 'REJECTED' && previouslyApproved) return 'businessHub.gateRejectedReapproval';
  return 'businessHub.gateManagementBlocked';
}
