import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radii, spacing } from '@/theme';

export default function PaymentMethodsScreen() {
  const { t } = useTranslation();

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('paymentMethods.title')} />
      <View style={styles.card}>
        <Ionicons name="card-outline" size={28} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyMedium" color="text">
            {t('paymentMethods.visaMock')}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {t('paymentMethods.defaultCard')}
          </AppText>
        </View>
      </View>
      <AppText variant="caption" color="textMuted">
        {t('paymentMethods.note')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
