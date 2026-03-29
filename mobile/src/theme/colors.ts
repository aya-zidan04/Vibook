/**
 * Vibook dark premium palette — layered surfaces, jewel accents.
 */
export const colors = {
  background: '#070B14',
  backgroundElevated: '#0C1220',
  surface: '#121A2B',
  surfaceHover: '#182236',
  surfaceMuted: '#0E1524',
  border: '#1F2A3F',
  borderLight: '#2A3752',
  text: '#F4F6FB',
  textSecondary: '#9BA4B5',
  textMuted: '#6B7589',
  primary: '#8B5CF6',
  primaryMuted: 'rgba(139, 92, 246, 0.22)',
  secondary: '#EC4899',
  secondaryMuted: 'rgba(236, 72, 153, 0.18)',
  accent: '#22D3EE',
  accentMuted: 'rgba(34, 211, 238, 0.16)',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  overlay: 'rgba(7, 11, 20, 0.72)',
  glowPrimary: 'rgba(139, 92, 246, 0.45)',
  glowAccent: 'rgba(34, 211, 238, 0.35)',
} as const;

export type ColorKey = keyof typeof colors;