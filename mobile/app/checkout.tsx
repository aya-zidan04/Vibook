import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function CheckoutScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const draft = useBookingDraftStore((s) => s.draft);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();

  if (!draft) {
    return (
      <Screen>
        <DetailHeader title={t('checkout.title')} />
        <AppText variant="body" color="textSecondary" style={styles.empty}>
          {t('checkout.empty')}
        </AppText>
        <PrimaryButton title={t('common.browse')} onPress={() => router.replace('/(tabs)/explore')} />
      </Screen>
    );
  }

  const subtotal = draft.unitPrice * draft.quantity;
  const total = subtotal + draft.fees;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.shell}>
        <DetailHeader title={t('checkout.title')} />
        <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
          <View style={styles.card}>
            <Image source={{ uri: draft.imageUrl }} style={styles.thumb} contentFit="cover" />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="h3" color="text" numberOfLines={2}>
                {draft.title}
              </AppText>
              {draft.tierName ? (
                <AppText variant="caption" color="textMuted">
                  {draft.tierName}
                </AppText>
              ) : null}
              {draft.metaLine ? (
                <AppText variant="caption" color="textSecondary">
                  {draft.metaLine}
                </AppText>
              ) : null}
              <AppText variant="meta" color="textMuted" style={{ textTransform: 'capitalize' }}>
                {draft.vertical}
              </AppText>
            </View>
          </View>

          <View style={styles.rows}>
            <Row label={t('checkout.quantity')} value={String(draft.quantity)} />
            <Row label={t('checkout.unit')} value={formatMoney(draft.unitPrice, draft.currency)} />
            <Row label={t('checkout.subtotal')} value={formatMoney(subtotal, draft.currency)} />
            <Row label={t('checkout.taxes')} value={formatMoney(draft.fees, draft.currency)} />
            <View style={styles.divider} />
            <Row label={t('common.total')} value={formatMoney(total, draft.currency)} bold />
          </View>

          <AppText variant="caption" color="textMuted" style={styles.legal}>
            {t('checkout.legal')}
          </AppText>
        </ScrollView>

        <View style={styles.footer}>
          <SecondaryButton title={t('common.back')} onPress={() => router.back()} style={styles.half} />
          <PrimaryButton
            title={`${t('checkout.pay')} ${formatMoney(total, draft.currency)}`}
            onPress={() => router.push('/payment')}
            style={styles.half}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <AppText variant="body" color="textSecondary">
        {label}
      </AppText>
      <AppText variant={bold ? 'price' : 'bodyMedium'} color="text">
        {value}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  shell: { flex: 1, paddingHorizontal: spacing.screen },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxxl, gap: spacing.lg },
  empty: { marginVertical: spacing.lg },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 96, height: 96, borderRadius: radii.lg },
  rows: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  legal: { lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  half: { flex: 1 },
});

}
