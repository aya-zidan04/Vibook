import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listPaymentMethods } from '@/api/paymentMethodsApi';
import { mapApiError } from '@/utils/mapApiError';
import { AppText } from '@/components/ui/AppText';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { SecondaryButton } from '@/components/ui/Button';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import type { PaymentMethodResponse } from '@/api/types';
import { useThemeColors } from '@/theme';

export default function PaymentMethodsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [cards, setCards] = useState<PaymentMethodResponse[]>([]);
  const [error, setError] = useState<unknown | null>(null);

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
        setError(e);
      }
    })();
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!isAuthenticated) {
    return (
      <PremiumScreen title={t('paymentMethods.title')}>
        <AppText variant="body" color="textSecondary">
          {t('favorites.backendSignInHint')}
        </AppText>
        <SecondaryButton sheet title={t('auth.loginCta')} onPress={() => router.push('/login')} />
      </PremiumScreen>
    );
  }

  if (error) {
    return (
      <PremiumScreen title={t('paymentMethods.title')}>
        <AppText variant="body" color="textSecondary">
          {mapApiError(error, t)}
        </AppText>
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen title={t('paymentMethods.title')}>
      {cards.length === 0 ? (
        <AppText variant="caption" color="textMuted">
          {t('paymentMethods.emptyBackend')}
        </AppText>
      ) : (
        cards.map((card) => (
          <View key={card.id} style={styles.paymentCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="card-outline" size={26} color={colors.primaryLight} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="body-em" color="text">
                {card.brand} ·••• {card.last4}
              </AppText>
              {card.isDefault ? (
                <AppText variant="caption" color="textMuted">
                  {t('paymentMethods.defaultCard')}
                </AppText>
              ) : null}
              <AppText variant="label" color="textMuted">
                {card.expiryMonth}/{card.expiryYear} · {card.cardHolderName}
              </AppText>
            </View>
          </View>
        ))
      )}

      <SecondaryButton sheet title={t('paymentMethods.addAnother')} onPress={() => router.push('/add-payment-method')} />

      <AppText variant="caption" color="textMuted" style={{ lineHeight: 20 }}>
        {t('paymentMethods.note')}
      </AppText>
    </PremiumScreen>
  );
}
