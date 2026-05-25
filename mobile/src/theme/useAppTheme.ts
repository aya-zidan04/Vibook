import { useMemo } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { themeForMode, type AppTheme, type ThemeButtons, type ThemeGradients } from './designSystem';

export function useAppTheme(): AppTheme {
  const scheme = useThemeStore((s) => s.colorScheme);
  return useMemo(() => themeForMode(scheme), [scheme]);
}

export function useThemeGradients(): ThemeGradients {
  const scheme = useThemeStore((s) => s.colorScheme);
  return useMemo(() => themeForMode(scheme).gradients, [scheme]);
}

export function useButtonVariants(): ThemeButtons {
  const scheme = useThemeStore((s) => s.colorScheme);
  return useMemo(() => themeForMode(scheme).buttons, [scheme]);
}
