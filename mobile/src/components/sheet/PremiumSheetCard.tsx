import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useThemeColors } from '@/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
};

export function PremiumSheetCard({ children, style, accent }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);

  return <View style={[styles.card, accent && styles.cardAccent, style]}>{children}</View>;
}
