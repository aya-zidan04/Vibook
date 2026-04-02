import { I18nManager } from 'react-native';

/** Trailing chevron for list rows / navigation (points toward the forward direction in reading order). */
export function chevronForwardTrailing(): 'chevron-forward' | 'chevron-back' {
  return I18nManager.isRTL ? 'chevron-back' : 'chevron-forward';
}
