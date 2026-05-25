import { darkTheme, lightTheme, themeForMode, type ThemeGradients } from './designSystem';
import type { ColorScheme } from '@/store/themeStore';

export type { ThemeGradients };

export function gradientsFor(scheme: ColorScheme): ThemeGradients {
  return themeForMode(scheme).gradients;
}

export const lightGradients = lightTheme.gradients;
export const darkGradients = darkTheme.gradients;
