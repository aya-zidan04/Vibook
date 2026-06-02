import type { ColorScheme } from '@/store/themeStore';
import { lightColors as lightSw } from './paletteColors';
import {
  pageBackgroundBase,
  pageBackgroundGradientEndColor,
  pageBackgroundGradientStartColor,
  pageBackgroundGradientVector,
} from './darkCanvas';

export function appBackgroundColorsFor(scheme: ColorScheme): readonly string[] {
  if (scheme === 'light') {
    return [lightSw.paleBone, lightSw.paleBone];
  }
  return [pageBackgroundGradientStartColor, pageBackgroundGradientEndColor];
}

export function appBackgroundLocationsFor(_scheme: ColorScheme): readonly number[] | undefined {
  return undefined;
}

export function appBackgroundStartFor(scheme: ColorScheme): { x: number; y: number } {
  if (scheme === 'light') {
    return { x: 0.5, y: 0 };
  }
  return pageBackgroundGradientVector.start;
}

export function appBackgroundEndFor(scheme: ColorScheme): { x: number; y: number } {
  if (scheme === 'light') {
    return { x: 0.5, y: 1 };
  }
  return pageBackgroundGradientVector.end;
}

export function appBackgroundBaseFor(scheme: ColorScheme): string {
  if (scheme === 'light') {
    return lightSw.paleBone;
  }
  return pageBackgroundBase;
}

/** @deprecated Use {@link appBackgroundColorsFor}. */
export const APP_BACKGROUND_COLORS = appBackgroundColorsFor('light');
/** @deprecated Use {@link appBackgroundBaseFor}. */
export const APP_BACKGROUND_BASE = appBackgroundBaseFor('light');
