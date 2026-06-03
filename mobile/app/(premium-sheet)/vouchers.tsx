import { useMemo, useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useLocaleStore } from '@/store/localeStore';
import type { Voucher } from '@/types';
import { useThemeColors } from '@/theme';

export default function VouchersScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const [extra, setExtra] = useState<Voucher[]>([]);
  const [code, setCode] = useState('');
  const [redeemBusy, setRedeemBusy] = useState(false);

  const displayList = useMemo(() => [...extra], [extra]);

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
    <PremiumScreen title={t('vouchers.title')}>
      <View style={[styles.insetCard, { gap: 12 }]}>
        <AppText variant="caption" color="textMuted">
          {t('vouchers.redeemLabel')}
        </AppText>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('vouchers.codePlaceholder')}
          placeholderTextColor={colors.placeholder}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />
        <PrimaryButton sheet title={t('vouchers.redeemCta')} onPress={() => void redeem()} loading={redeemBusy} />
      </View>

      {displayList.length === 0 ? (
        <EmptyState
          icon="pricetag-outline"
          title={t('vouchers.emptyTitle')}
          description={t('vouchers.emptyDesc')}
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
          {displayList.map((v) => (
            <VoucherCard key={v.id} v={v} locale={locale} styles={styles} t={t} />
          ))}
        </ScrollView>
      )}
    </PremiumScreen>
  );
}

function VoucherCard({
  v,
  locale,
  styles,
  t,
}: {
  v: Voucher;
  locale: 'en' | 'ar';
  styles: ReturnType<typeof createPremiumSheetStyles>;
  t: (k: string) => string;
}) {
  const { formatMoney } = useFormatMoney();
  const displayCurrency = useLocaleStore((s) => s.currency);
  const title = locale === 'ar' && v.titleAr ? v.titleAr : v.title;
  const off =
    v.discountType === 'percent'
      ? t('vouchers.offPercent').replace('{n}', String(v.discountValue))
      : formatMoney(v.discountValue, displayCurrency);

  return (
    <View style={[styles.voucherCard, v.redeemed && { opacity: 0.75 }]}>
      <AppText variant="label" color="primaryLight">
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
