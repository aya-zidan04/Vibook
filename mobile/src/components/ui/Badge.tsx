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

function tonesFor(colors: ThemeColors): Record<BadgeTone, { bg: string; fg: keyof ThemeColors }> {
  return {
    popular: { bg: colors.secondaryMuted, fg: 'secondary' },
    limited: { bg: colors.accentMuted, fg: 'accent' },
    new: { bg: colors.primaryMuted, fg: 'primary' },
    soldFast: { bg: 'rgba(163, 90, 64, 0.22)', fg: 'error' },
    exclusive: { bg: 'rgba(185, 114, 76, 0.28)', fg: 'primary' },
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
    <View style={[styles.wrap, { backgroundColor: style.bg }]}>
      <AppText variant="meta" color={style.fg} style={[styles.txt, isRTL && styles.txtRtl]}>
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
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      fontWeight: '700',
    },
    txtRtl: {
      textTransform: 'none',
      letterSpacing: 0,
    },
  });
