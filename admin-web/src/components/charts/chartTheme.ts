export const chartColors = {
  terracotta: '#c4896c',
  plum: '#5b3b4b',
  plumLight: '#8a6b7a',
  success: '#2e7d4a',
  warning: '#c9946a',
  error: '#a35a40',
  draft: '#8a7b82',
  grid: '#eae3dd',
  axis: '#5c4d55',
};

export const statusBarColors: Record<string, string> = {
  APPROVED: chartColors.success,
  PENDING_REVIEW: chartColors.warning,
  REJECTED: chartColors.error,
  DRAFT: chartColors.draft,
};

export const pieColors = [chartColors.success, chartColors.warning, chartColors.error, chartColors.draft];
