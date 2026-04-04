import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { MOCK_VOUCHERS } from '@/services/mock';
import { useLocaleStore } from '@/store/localeStore';
import type { Voucher } from '@/types';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function VouchersScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const [extra, setExtra] = useState<Voucher[]>([]);
  const [code, setCode] = useState('');
  const [redeemBusy, setRedeemBusy] = useState(false);

  const displayList = useMemo(() => [...MOCK_VOUCHERS, ...extra], [extra]);

  const redeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      Alert.alert(t('common.error'), t('vouchers.codeRequired'));
      return;
    }
    if (displayList.some((v) => v.code.toUpperCase() === trimmed)) {
      Alert.alert(t('common.error'), t('vouchers.errorRedeemed'));
      return;
    }
    setRedeemBusy(true);
    setTimeout(() => {
      setExtra((prev) => [
        {
          id: `local-${Date.now()}`,
          code: trimmed,
          title: `${t('vouchers.title')} · ${trimmed}`,
          titleAr: undefined,
          discountValue: 10,
          discountType: 'percent',
          expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
          redeemed: false,
        },
        ...prev,
      ]);
      setCode('');
      setRedeemBusy(false);
      Alert.alert(t('vouchers.redeemSuccessTitle'), t('vouchers.redeemSuccessBody'));
    }, 400);
  };

  return (
    <Screen scroll contentStyle={styles.pad} header={<DetailHeader title={t('vouchers.title')} />}>
      <View style={styles.redeemBox}>
        <AppText variant="caption" color="textMuted">
          {t('vouchers.redeemLabel')}
        </AppText>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('vouchers.codePlaceholder')}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />
        <PrimaryButton title={t('vouchers.redeemCta')} onPress={() => void redeem()} loading={redeemBusy} />
      </View>
      {displayList.length === 0 ? (
        <EmptyState
          icon="pricetag-outline"
          title={t('vouchers.emptyTitle')}
          description={t('vouchers.emptyDesc')}
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {displayList.map((v) => (
            <VoucherCard key={v.id} v={v} locale={locale} styles={styles} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function VoucherCard({
  v,
  locale,
  styles,
}: {
  v: Voucher;
  locale: 'en' | 'ar';
  styles: ReturnType<typeof createStyles>;
}) {
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const displayCurrency = useLocaleStore((s) => s.currency);
  const title = locale === 'ar' && v.titleAr ? v.titleAr : v.title;
  const off =
    v.discountType === 'percent'
      ? t('vouchers.offPercent').replace('{n}', String(v.discountValue))
      : formatMoney(v.discountValue, displayCurrency);
  return (
    <View style={[styles.card, v.redeemed && styles.cardRedeemed]}>
      <AppText variant="meta" color="accent">
        {v.code}
      </AppText>
      <AppText variant="h3" color="text" numberOfLines={2}>
        {title}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {off}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {v.expiresAt.slice(0, 10)}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    redeemBox: {
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      color: colors.text,
      backgroundColor: colors.backgroundElevated,
    },
    card: {
      width: 220,
      marginEnd: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
      marginBottom: spacing.lg,
    },
    cardRedeemed: { opacity: 0.75 },
  });
}
