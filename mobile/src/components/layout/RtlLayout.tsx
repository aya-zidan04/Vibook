import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocaleStore } from '@/store/localeStore';
import { syncNativeRtl } from '@/utils/rtl';

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
    syncNativeRtl(rtl);
  }, [rtl]);

  return <View style={[styles.root, { direction: dir }]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
});
