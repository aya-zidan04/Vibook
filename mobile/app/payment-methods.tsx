import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listPaymentMethods } from '@/api/paymentMethodsApi';
import { ApiError } from '@/api/http';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import type { PaymentMethodResponse } from '@/api/types';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function PaymentMethodsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [cards, setCards] = useState<PaymentMethodResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!isAuthenticated) {
      setCards([]);
      setError(null);
      return;
    }
    void (async () => {
      try {
        const rows = await listPaymentMethods();
        setCards(rows);
        setError(null);
      } catch (e) {
        setCards([]);
        setError(e instanceof ApiError ? e.message : t('common.error'));
      }
    })();
  }, [isAuthenticated, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onAddAnother = () => {
    router.push('/add-payment-method');
  };

  if (!isAuthenticated) {
    return (
      <Screen
        scroll
        contentStyle={styles.pad}
        header={<DetailHeader title={t('paymentMethods.title')} />}
      >
        <AppText variant="body" color="textSecondary">
          {t('favorites.backendSignInHint')}
        </AppText>
        <SecondaryButton title={t('auth.loginCta')} onPress={() => router.push('/login')} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen
        scroll
        contentStyle={styles.pad}
        header={<DetailHeader title={t('paymentMethods.title')} />}
      >
        <AppText variant="body" color="textSecondary">
          {error}
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={<DetailHeader title={t('paymentMethods.title')} />}
    >
      {cards.length === 0 ? (
        <AppText variant="caption" color="textMuted" style={styles.footNote}>
          {t('paymentMethods.emptyBackend')}
        </AppText>
      ) : (
        cards.map((card) => (
          <View key={card.id} style={styles.card}>
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
              <AppText variant="meta" color="textMuted">
                {card.expiryMonth}/{card.expiryYear} · {card.cardHolderName}
              </AppText>
            </View>
          </View>
        ))
      )}

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
