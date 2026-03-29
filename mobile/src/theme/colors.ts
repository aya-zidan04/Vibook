export const colors = {
  primary: '#5B4FD9',
  primaryLight: '#7C71E8',
  primaryMuted: '#E8E6FC',
  primaryDark: '#4338CA',
  accent: '#0EA5E9',
  background: '#F3F4F8',
  backgroundElevated: '#FAFAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F1F5',
  border: '#E8EAEF',
  borderLight: '#EFEFF4',
  text: '#12131A',
  textSecondary: '#5C5F6E',
  textMuted: '#8B8F9E',
  overlay: 'rgba(18, 19, 26, 0.48)',
  overlayLight: 'rgba(18, 19, 26, 0.35)',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  favorite: '#EF4444',
} as const;

export type ColorName = keyof typeof colors;
