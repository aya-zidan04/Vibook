/**
 * Global ambient canvas — built from palette swatches only.
 */

import {
  pageBackgroundBase,
  pageBackgroundGradientEndColor,
  pageBackgroundGradientStartColor,
  pageBackgroundGradientVector,
} from './darkCanvas';
import { darkColors as darkSw, lightColors as lightSw } from './paletteColors';
import type { ColorScheme } from '@/store/themeStore';

export const cinematic = {
  lightBase: lightSw.paleBone,
  lightWash: lightSw.softMint,
  lightSage: lightSw.pastelSage,
  lightMint: lightSw.mintOffWhite,
  lightAccent: lightSw.neonYellow,
  lightPrimary: lightSw.limeGreen,
  darkBase: darkSw.black,
  darkSurface: darkSw.charcoal,
  darkAccent: darkSw.neonLime,
  darkHighlight: darkSw.paleYellow,
  darkText: darkSw.white,
} as const;

export type AmbientLinearLayer = {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export type AmbientGlowOrb = {
  color: string;
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  opacity: number;
};

export type AmbientPreset = {
  base: string;
  layers: AmbientLinearLayer[];
  glows: AmbientGlowOrb[];
};

const cinematicPageAmbient: AmbientPreset = {
  base: pageBackgroundBase,
  layers: [
    {
      colors: [pageBackgroundGradientStartColor, pageBackgroundGradientEndColor],
      start: pageBackgroundGradientVector.start,
      end: pageBackgroundGradientVector.end,
    },
  ],
  glows: [],
};

export function ambientPresetFor(_scheme: ColorScheme): AmbientPreset {
  return cinematicPageAmbient;
}

export function ambientBaseFor(_scheme: ColorScheme): string {
  return pageBackgroundBase;
}
