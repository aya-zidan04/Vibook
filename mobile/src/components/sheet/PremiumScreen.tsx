import type { ReactNode } from 'react';
import { useRouter, type Href } from 'expo-router';
import { PremiumSheetLayout } from '@/components/sheet/PremiumSheetLayout';
import { useSheetClose } from '@/components/sheet/useSheetClose';
import type { ViewStyle } from 'react-native';

type Props = {
  title: string;
  children: ReactNode;
  /** Show back chevron (pops stack). Default: true when stack can go back. */
  showBack?: boolean;
  closeFallback?: Href;
  contentStyle?: ViewStyle;
};

export function PremiumScreen({ title, children, showBack, closeFallback, contentStyle }: Props) {
  const router = useRouter();
  const close = useSheetClose(closeFallback);
  const canBack = router.canGoBack();
  const onBack = showBack !== false && canBack ? () => router.back() : undefined;

  return (
    <PremiumSheetLayout title={title} onClose={close} onBack={onBack} contentStyle={contentStyle}>
      {children}
    </PremiumSheetLayout>
  );
}
