import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  hero: {
    fontFamily,
    fontSize: 30,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  cardTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily,
    fontSize: 15,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  caption: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 18,
  },
  overline: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.8,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.35,
    lineHeight: 16,
  },
  price: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 20,
  },
} as const;
