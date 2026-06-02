import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n/useTranslation';
import {
  chevronBackLeading,
  chevronForwardTrailing,
  chevronNextTrailing,
  chevronPrevLeading,
} from '@/utils/rtl';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  size?: number;
  color: string;
};

/** Back / dismiss direction — points right in Arabic, left in English. */
export function NavigationChevronBack({ size = 28, color }: Props) {
  const { isRTL } = useTranslation();
  return <Ionicons name={chevronBackLeading(isRTL)} size={size} color={color} />;
}

/** Forward / drill-in direction — points left in Arabic, right in English. */
export function NavigationChevronForward({ size = 20, color }: Props) {
  const { isRTL } = useTranslation();
  return <Ionicons name={chevronForwardTrailing(isRTL)} size={size} color={color} />;
}

/** Calendar / pager — previous (earlier). */
export function NavigationChevronPrev({ size = 18, color }: Props) {
  const { isRTL } = useTranslation();
  return <Ionicons name={chevronPrevLeading(isRTL)} size={size} color={color} />;
}

/** Calendar / pager — next (later). */
export function NavigationChevronNext({ size = 18, color }: Props) {
  const { isRTL } = useTranslation();
  return <Ionicons name={chevronNextTrailing(isRTL)} size={size} color={color} />;
}

/** Convenience for themed colors from useThemeColors(). */
export type NavigationChevronColor = keyof ThemeColors;
