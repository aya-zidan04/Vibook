import { chartPalette } from '@/theme/colors';

/** Chart palette — uses CSS variables so light/dark theme tracks admin-theme.css. */
export const chartColors = {
  terracotta: chartPalette.primary,
  plum: chartPalette.text,
  plumLight: chartPalette.primaryLight,
  accent: chartPalette.accent,
  accentSoft: chartPalette.accentSoft,
  accentLight: chartPalette.accentLight,
  success: chartPalette.success,
  warning: chartPalette.warning,
  error: chartPalette.error,
  draft: chartPalette.draft,
  grid: chartPalette.grid,
  axis: chartPalette.axis,
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
