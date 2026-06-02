import type { TextStyle, ViewStyle } from 'react-native';

export type HorizontalTextAlign = 'left' | 'right';

/**
 * Start-aligned text. Always `'left'`: under `I18nManager.forceRTL` RN mirrors
 * left/right so `'left'` lands on the visual start (right in Arabic, left in English).
 */
export function textAlignStart(_isRTL: boolean): HorizontalTextAlign {
  return 'left';
}

/** End-aligned text — mirrored to the visual end edge in RTL layouts. */
export function textAlignEnd(_isRTL: boolean): HorizontalTextAlign {
  return 'right';
}

/** Text-only start alignment for labels/values (no layout/flex overrides). */
export function formAlignStyle(isRTL: boolean): TextStyle {
  return { textAlign: textAlignStart(isRTL) };
}

/** LTR technical inputs (email, phone digits, URLs) — always left-aligned. */
export function technicalInputStyle(): TextStyle {
  return {
    textAlign: 'left',
    writingDirection: 'ltr',
  };
}

/** @deprecated Prefer {@link technicalInputStyle} */
export function phoneInputStyle(): TextStyle {
  return technicalInputStyle();
}

/** Prevents RTL from mirroring leading icons / phone prefix to the visual right. */
export const leadingIconRowStyle: ViewStyle = {
  direction: 'ltr',
  flexDirection: 'row',
};

/** @deprecated Use {@link leadingIconRowStyle} */
export const technicalFieldRowStyle: ViewStyle = leadingIconRowStyle;
