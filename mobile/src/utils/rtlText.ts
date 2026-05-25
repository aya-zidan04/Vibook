export type HorizontalTextAlign = 'left' | 'right';

export function textAlignStart(isRTL: boolean): HorizontalTextAlign {
  return isRTL ? 'right' : 'left';
}

export function textAlignEnd(isRTL: boolean): HorizontalTextAlign {
  return isRTL ? 'left' : 'right';
}
