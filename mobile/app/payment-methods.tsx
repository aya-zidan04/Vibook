import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { SecondaryButton } from '@/components/ui/Button';
import { MOCK_PRIMARY_CARD } from '@/mock/paymentMethods';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function PaymentMethodsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const card = MOCK_PRIMARY_CARD;

  const onAddAnother = () => {
    router.push('/add-payment-method');
  };

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('paymentMethods.title')} />

      <View style={styles.card}>
        <Ionicons name="card-outline" size={28} color={colors.primary} />
        <View style={styles.cardText}>
          <AppText variant="bodyMedium" color="text">
            {card.brand} ·••• {card.last4}
          </AppText>
          {card.isDefault ? (
            <AppText variant="caption" color="textMuted">
              {t('paymentMethods.defaultCard')}
            </AppText>
          ) : null}
        </View>
      </View>

      <SecondaryButton title={t('paymentMethods.addAnother')} onPress={onAddAnother} />

      <AppText variant="caption" color="textMuted" style={styles.footNote}>
        {t('paymentMethods.note')}
      </AppText>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
    cardText: {
      flex: 1,
      gap: 4,
    },
    footNote: {
      lineHeight: 20,
      marginTop: -spacing.xs,
    },
  });
}
