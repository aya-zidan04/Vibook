import { Platform, TextStyle } from 'react-native';

const system = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  display: {
    fontFamily: system,
    fontSize: 34,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -1,
    lineHeight: 40,
  },
  h1: {
    fontFamily: system,
    fontSize: 26,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  h2: {
    fontFamily: system,
    fontSize: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  h3: {
    fontFamily: system,
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontFamily: system,
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: system,
    fontSize: 15,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  caption: {
    fontFamily: system,
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 18,
  },
  meta: {
    fontFamily: system,
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  overline: {
    fontFamily: system,
    fontSize: 11,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 1,
    lineHeight: 14,
  },
  price: {
    fontFamily: system,
    fontSize: 17,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
    lineHeight: 22,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
