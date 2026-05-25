import { ReactNode } from 'react';
import { PremiumSheetLayout } from '@/components/sheet/PremiumSheetLayout';
import type { ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  onClose: () => void;
  contentStyle?: ViewStyle;
};

/** Auth login/signup sheet — same premium modal shell as Settings. */
export function AuthSheetLayout({ children, onClose, contentStyle }: Props) {
  return (
    <PremiumSheetLayout onClose={onClose} contentStyle={contentStyle} authMode>
      {children}
    </PremiumSheetLayout>
  );
}
