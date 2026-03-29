import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { colors, radii } from '@/theme';
import type { BadgeTone } from '@/types';

const LABELS: Record<BadgeTone, string> = {
  popular: 'Popular',
  limited: 'Limited',
  new: 'New',
  soldFast: 'Selling fast',
  exclusive: 'Exclusive',
};

const TONES: Record<BadgeTone, { bg: string; fg: keyof typeof colors }> = {
  popular: { bg: colors.secondaryMuted, fg: 'secondary' },
  limited: { bg: colors.accentMuted, fg: 'accent' },
  new: { bg: colors.primaryMuted, fg: 'primary' },
  soldFast: { bg: 'rgba(248, 113, 113, 0.2)', fg: 'error' },
  exclusive: { bg: 'rgba(167, 139, 250, 0.25)', fg: 'primary' },
};

type Props = {
  tone: BadgeTone;
};

export function Badge({ tone }: Props) {
  const t = TONES[tone];
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <AppText variant="meta" color={t.fg} style={styles.txt}>
        {LABELS[tone]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
