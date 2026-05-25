/**
 * Global ambient canvas — premium navy/plum gradient + accent glows.
 */

import { brand } from './designSystem';
import type { ColorScheme } from '@/store/themeStore';

export const cinematic = {
  navyDeep: '#08111F',
  navyMid: '#111827',
  navySoft: '#152238',
  plum: '#5B3B4B',
  plumSoft: 'rgba(91, 59, 75, 0.45)',
  terracotta: '#C4896C',
  terracottaSoft: 'rgba(196, 137, 108, 0.3)',
  cyan: '#16C6FF',
  cyanSoft: 'rgba(22, 198, 255, 0.24)',
  pink: '#FF6FAE',
  pinkSoft: 'rgba(255, 111, 174, 0.28)',
  creamTint: 'rgba(247, 239, 231, 0.06)',
  lightBase: brand.lightGray,
  lightWash: '#FFFFFF',
  lightPink: brand.pinkBg,
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

const darkAmbient: AmbientPreset = {
  base: cinematic.navyDeep,
  layers: [
    {
      colors: [cinematic.navyDeep, cinematic.navyMid, '#0C1526'],
      locations: [0, 0.5, 1],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
    {
      colors: ['transparent', cinematic.plumSoft, 'rgba(91, 59, 75, 0.2)'],
      locations: [0, 0.45, 1],
      start: { x: 0, y: 0.1 },
      end: { x: 1, y: 0.85 },
    },
    {
      colors: ['transparent', cinematic.terracottaSoft],
      locations: [0.35, 1],
      start: { x: 1, y: 0.5 },
      end: { x: 0.15, y: 1 },
    },
    {
      colors: [cinematic.cyanSoft, 'transparent'],
      locations: [0, 0.75],
      start: { x: 1, y: 0 },
      end: { x: 0.25, y: 0.42 },
    },
    {
      colors: [cinematic.pinkSoft, 'transparent', cinematic.creamTint],
      locations: [0, 0.55, 1],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
  ],
  glows: [
    { color: cinematic.cyan, size: 320, top: -110, right: -75, opacity: 0.18 },
    { color: cinematic.plum, size: 400, top: 300, left: -130, opacity: 0.16 },
    { color: cinematic.pink, size: 300, bottom: -95, right: -55, opacity: 0.14 },
    { color: cinematic.terracotta, size: 260, bottom: 100, left: -80, opacity: 0.1 },
  ],
};

const lightAmbient: AmbientPreset = {
  base: cinematic.lightBase,
  layers: [
    {
      colors: [cinematic.lightWash, '#F8FAFC', cinematic.lightBase],
      locations: [0, 0.45, 1],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
    {
      colors: ['transparent', 'rgba(91, 59, 75, 0.1)', 'transparent'],
      locations: [0, 0.5, 1],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0.75 },
    },
    {
      colors: ['transparent', cinematic.terracottaSoft],
      locations: [0.4, 1],
      start: { x: 1, y: 0.55 },
      end: { x: 0, y: 1 },
    },
    {
      colors: [cinematic.cyanSoft, 'transparent'],
      locations: [0, 0.7],
      start: { x: 1, y: 0.05 },
      end: { x: 0.4, y: 0.38 },
    },
    {
      colors: [cinematic.pinkSoft, 'transparent'],
      locations: [0, 1],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
  ],
  glows: [
    { color: cinematic.cyan, size: 280, top: -85, right: -65, opacity: 0.12 },
    { color: cinematic.pink, size: 340, bottom: -75, left: -95, opacity: 0.1 },
    { color: cinematic.plum, size: 260, bottom: 130, right: -45, opacity: 0.08 },
  ],
};

export function ambientPresetFor(scheme: ColorScheme): AmbientPreset {
  return scheme === 'light' ? lightAmbient : darkAmbient;
}

export function ambientBaseFor(_scheme: ColorScheme): string {
  return '#FFF7FB';
}
