import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { radii } from '@/theme/spacing';
import type { BadgeTone } from '@/types';

const BADGE_KEYS: Record<BadgeTone, `badge.${BadgeTone}`> = {
  popular: 'badge.popular',
  limited: 'badge.limited',
  new: 'badge.new',
  soldFast: 'badge.soldFast',
  exclusive: 'badge.exclusive',
};

function tonesFor(
  colors: ThemeColors,
): Record<BadgeTone, { bg: string; fg: keyof ThemeColors; border?: string }> {
  return {
    popular: { bg: colors.accentBg, fg: 'accentText', border: colors.accentBorder },
    limited: { bg: colors.accentBg, fg: 'accentText', border: colors.accentBorder },
    new: { bg: colors.primaryMuted, fg: 'primary' },
    soldFast: { bg: colors.accentBg, fg: 'accentText', border: colors.accentBorder },
    exclusive: { bg: colors.accentBg, fg: 'accentText', border: colors.accentBorder },
  };
}

type Props = {
  tone: BadgeTone;
};

export function Badge({ tone }: Props) {
  const colors = useThemeColors();
  const TONES = useMemo(() => tonesFor(colors), [colors]);
  const style = TONES[tone];
  const { t, isRTL } = useTranslation();
  const styles = useMemo(() => makeStyles(), []);
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: style.bg },
        style.border ? { borderWidth: 1, borderColor: style.border } : null,
      ]}
    >
      <AppText variant="label" color={style.fg} style={[styles.txt, isRTL && styles.txtRtl]}>
        {t(BADGE_KEYS[tone])}
      </AppText>
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radii.xs,
      alignSelf: 'flex-start',
    },
    txt: {
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    txtRtl: {
      textTransform: 'none',
      letterSpacing: 0,
    },
  });
