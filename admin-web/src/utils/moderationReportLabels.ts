import type { ModerationReportType } from '@/api/types';

const TYPE_KEYS: Record<ModerationReportType, string> = {
  BOOKING: 'reports.types.booking',
  EVENT: 'reports.types.event',
  USER: 'reports.types.user',
  RATING: 'reports.types.rating',
  BUSINESS_PROFILE: 'reports.types.businessProfile',
  OTHER: 'reports.types.other',
};

export function moderationReportTypeLabel(
  type: ModerationReportType,
  t: (key: string) => string,
): string {
  const key = TYPE_KEYS[type];
  const label = t(key);
  return label === key ? type : label;
}
