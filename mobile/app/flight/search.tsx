import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { MOCK_FLIGHTS } from '@/mock/flights';
import { colors, radii, spacing } from '@/theme';

const ORIGINS = Array.from(new Set(MOCK_FLIGHTS.map((f) => f.from)));
const DESTS = Array.from(new Set(MOCK_FLIGHTS.map((f) => f.to)));

export default function FlightSearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [from, setFrom] = useState(MOCK_FLIGHTS[0]?.from ?? 'RUH');
  const [to, setTo] = useState(MOCK_FLIGHTS[0]?.to ?? 'DXB');

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('flight.searchTitle')} />
      <AppText variant="body" color="textSecondary" style={styles.intro}>
        {t('flight.intro')}
      </AppText>
      <AppText variant="h3" color="text">
        {t('flight.from')}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {ORIGINS.map((o) => (
          <Pressable key={o} onPress={() => setFrom(o)} style={[styles.chip, from === o && styles.chipOn]}>
            <AppText variant="meta" color={from === o ? 'text' : 'textMuted'}>
              {o}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
      <AppText variant="h3" color="text" style={styles.mt}>
        {t('flight.to')}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {DESTS.map((d) => (
          <Pressable key={d} onPress={() => setTo(d)} style={[styles.chip, to === d && styles.chipOn]}>
            <AppText variant="meta" color={to === d ? 'text' : 'textMuted'}>
              {d}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
      <PrimaryButton
        title={t('flight.searchCta')}
        onPress={() =>
          router.push({
            pathname: '/flight/results',
            params: { from, to },
          })
        }
        style={styles.btn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.md },
  intro: { lineHeight: 22, marginBottom: spacing.sm },
  row: { marginVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  mt: { marginTop: spacing.md },
  btn: { marginTop: spacing.xl },
});
