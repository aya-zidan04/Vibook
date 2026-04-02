import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { MOCK_FLIGHTS } from '@/services/mock';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&auto=format&fit=crop';

function flightStopLabel(stops: number, t: (p: string) => string) {
  if (stops === 0) return t('flight.nonstop');
  if (stops === 1) return `1 ${t('flight.stop')}`;
  return `${stops} ${t('flight.stops')}`;
}

export default function FlightResultsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const { from, to } = useLocalSearchParams<{ from?: string; to?: string }>();
  const list = MOCK_FLIGHTS.filter((f) => (!from || f.from === from) && (!to || f.to === to));
  const fromLabel = from ?? t('flight.any');
  const toLabel = to ?? t('flight.any');

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('flight.resultsTitle')} />
      <AppText variant="caption" color="textMuted">
        {fromLabel} → {toLabel}
      </AppText>
      {list.length === 0 ? (
        <AppText variant="body" color="textSecondary" style={styles.empty}>
          {t('flight.empty')}
        </AppText>
      ) : (
        <View style={styles.list}>
          {list.map((f) => (
            <Pressable key={f.id} style={styles.card} onPress={() => router.push(`/flight/${f.id}`)}>
              <Image source={{ uri: PLACEHOLDER }} style={styles.thumb} contentFit="cover" />
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="bodyMedium" color="text">
                  {f.from} → {f.to}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {f.airline} · {f.cabin}
                </AppText>
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <AppText variant="meta" color="textSecondary">
                    {f.durationMin} min · {flightStopLabel(f.stops, t)}
                  </AppText>
                </View>
              </View>
              <AppText variant="price" color="accent">
                {formatMoney(f.price, f.currency)}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.md },
  empty: { marginTop: spacing.lg, lineHeight: 22 },
  list: { gap: spacing.md, marginBottom: spacing.xxxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 88, height: 72, borderRadius: radii.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

}
