import { type ReactNode, useEffect } from 'react';
import { I18nManager, Platform, StyleSheet, View } from 'react-native';
import { useLocaleStore } from '@/store/localeStore';

type Props = { children: ReactNode };

/**
 * Applies global RTL when locale is Arabic: layout `direction`, `I18nManager.forceRTL`,
 * so rows, stacks, and horizontal lists start from the right.
 */
export function RtlLayout({ children }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const rtl = locale === 'ar';
  const dir = rtl ? 'rtl' : 'ltr';

  useEffect(() => {
    I18nManager.allowRTL(true);
    if (I18nManager.isRTL !== rtl) {
      I18nManager.forceRTL(rtl);
      if (Platform.OS === 'android') {
        // Some Android builds apply forceRTL fully only after restart; `direction` on root still mirrors flex.
      }
    }
  }, [rtl]);

  return <View style={[styles.root, { direction: dir }]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
