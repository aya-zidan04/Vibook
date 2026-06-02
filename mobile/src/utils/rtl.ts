import { I18nManager } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useLocaleStore } from '@/store/localeStore';

/** Resolve RTL from explicit flag or persisted locale (preferred over I18nManager alone). */
export function resolveIsRTL(isRTL?: boolean): boolean {
  if (isRTL !== undefined) return isRTL;
  return useLocaleStore.getState().locale === 'ar';
}

/** Trailing chevron for list rows / navigation (points toward forward in reading order). */
export function chevronForwardTrailing(isRTL?: boolean): 'chevron-forward' | 'chevron-back' {
  return resolveIsRTL(isRTL) ? 'chevron-back' : 'chevron-forward';
}

/** Leading chevron on back buttons (points toward back in reading order). */
export function chevronBackLeading(isRTL?: boolean): 'chevron-forward' | 'chevron-back' {
  return resolveIsRTL(isRTL) ? 'chevron-forward' : 'chevron-back';
}

/** Previous control in calendars / pagers (earlier page or month). */
export function chevronPrevLeading(isRTL?: boolean): 'chevron-forward' | 'chevron-back' {
  return chevronBackLeading(isRTL);
}

/** Next control in calendars / pagers (later page or month). */
export function chevronNextTrailing(isRTL?: boolean): 'chevron-forward' | 'chevron-back' {
  return chevronForwardTrailing(isRTL);
}

/** Header/toolbar row: `direction` mirrors layout; keep `row` so start edge flips in RTL. */
export function navigationRowStyle(isRTL: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    direction: isRTL ? 'rtl' : 'ltr',
    width: '100%',
  };
}

/** Sync native RTL manager with locale (called from RtlLayout). */
export function syncNativeRtl(rtl: boolean): void {
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl);
  }
}

/**
 * @deprecated Prefer {@link navigationRowStyle} for locale-aware chrome.
 * Kept for bottom tab bar / business tab bar where tab order stays LTR by design.
 */
export const ltrNavigationChrome: ViewStyle = {
  direction: 'ltr',
  width: '100%',
};
