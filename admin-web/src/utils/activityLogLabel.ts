import type { AdminActivityAction } from '@/api/types';

const LABELS: Record<AdminActivityAction, string> = {
  APPROVE_BUSINESS_PROFILE: 'Approved a business profile',
  REJECT_BUSINESS_PROFILE: 'Rejected a business profile',
  BULK_APPROVE_BUSINESS_PROFILES: 'Bulk approved business profiles',
  BULK_REJECT_BUSINESS_PROFILES: 'Bulk rejected business profiles',
  UPDATE_BUSINESS_NOTES: 'Updated admin notes',
  CREATE_CATEGORY: 'Created a category',
  UPDATE_CATEGORY: 'Updated a category',
  DELETE_CATEGORY: 'Deleted a category',
  UPDATE_GOVERNORATE_STATUS: 'Updated a governorate',
  UPDATE_USER_ROLES: 'Changed user roles',
  ENABLE_USER: 'Enabled a user account',
  DISABLE_USER: 'Disabled a user account',
};

export function activityActionLabel(action: AdminActivityAction): string {
  return LABELS[action] ?? action;
}
