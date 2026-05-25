export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 28,
  screen: 20,
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 9999,
} as const;

/** Pill-shaped CTAs (capsule ends) — used by PrimaryButton / SecondaryButton. */
export const buttonMetrics = {
  borderRadius: radii.full,
  minHeight: 52,
  paddingVertical: 14,
  paddingHorizontal: spacing.xxl,
} as const;
