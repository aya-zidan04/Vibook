/** Chart palette — aligned with mobile `designSystem` (blue primary, pink accent). */
export const chartColors = {
  terracotta: '#00C2FF',
  plum: '#111827',
  plumLight: '#33D6FF',
  accent: '#FF4D8D',
  accentSoft: '#FF70A6',
  accentLight: '#FFE3EE',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  draft: '#6B7280',
  grid: '#EEF2F6',
  axis: '#4B5563',
};

export const statusBarColors: Record<string, string> = {
  APPROVED: chartColors.success,
  PENDING_REVIEW: chartColors.warning,
  REJECTED: chartColors.error,
  DRAFT: chartColors.draft,
};

export const pieColors = [
  chartColors.success,
  chartColors.accent,
  chartColors.warning,
  chartColors.terracotta,
  chartColors.draft,
];
