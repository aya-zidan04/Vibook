import { ReactNode } from 'react';
import { AppBackground } from '@/components/ui/AppBackground';
import type { ViewStyle } from 'react-native';

type Props = {
  children?: ReactNode;
  style?: ViewStyle;
};

/** @deprecated Prefer {@link AppBackground} — kept for layout call sites. */
export function PageShell({ children, style }: Props) {
  return <AppBackground style={style}>{children}</AppBackground>;
}
