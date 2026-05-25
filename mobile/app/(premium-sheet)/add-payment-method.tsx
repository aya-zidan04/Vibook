import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { addPaymentMethod } from '@/api/paymentMethodsApi';
import { ApiError } from '@/api/http';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing } from '@/theme';

function digitsOnly(s: string, max: number): string {
  return s.replace(/\D/g, '').slice(0, max);
}

function formatGroupsOf4(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export default function AddPaymentMethodScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [number, setNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const numberDisplay = useMemo(() => formatGroupsOf4(number), [number]);

  const onNumberChange = (text: string) => {
    setNumber(digitsOnly(text, 19));
  };

  const onExpiryChange = (text: string) => {
    const d = digitsOnly(text, 4);
    setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  const onCvcChange = (text: string) => {
    setCvc(digitsOnly(text, 4));
  };

  const submit = () => {
    const pan = number.replace(/\D/g, '');
    if (pan.length < 15 || pan.length > 19) {
      Alert.alert(t('common.error'), t('paymentMethods.errCardNumber'));
      return;
    }
    if (!nameOnCard.trim()) {
      Alert.alert(t('common.error'), t('paymentMethods.errCardholder'));
      return;
    }
    const expRaw = expiry.replace(/\D/g, '');
    if (expRaw.length !== 4) {
      Alert.alert(t('common.error'), t('paymentMethods.errExpiry'));
      return;
    }
    const mm = parseInt(expRaw.slice(0, 2), 10);
    if (mm < 1 || mm > 12) {
      Alert.alert(t('common.error'), t('paymentMethods.errExpiry'));
      return;
    }
    const yy = parseInt(expRaw.slice(2, 4), 10);
    const yyyy = yy < 100 ? 2000 + yy : yy;
    const cvcDigits = cvc.replace(/\D/g, '');
    if (cvcDigits.length < 3 || cvcDigits.length > 4) {
      Alert.alert(t('common.error'), t('paymentMethods.errCvc'));
      return;
    }

    void (async () => {
      try {
        await addPaymentMethod({
          cardNumber: pan,
          cardHolderName: nameOnCard.trim(),
          expiryMonth: mm,
          expiryYear: yyyy,
          cvc: cvcDigits,
        });
        Alert.alert(t('paymentMethods.addCardSuccessTitle'), t('paymentMethods.addCardSuccessBody'), [
          { text: t('common.ok'), onPress: () => router.back() },
        ]);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : t('common.error');
        Alert.alert(t('common.error'), msg);
      }
    })();
  };

  return (
    <PremiumScreen title={t('paymentMethods.addAnother')}>
      <AppText variant="caption" color="textMuted" style={{ lineHeight: 20 }}>
        {t('paymentMethods.addCardMockNote')}
      </AppText>

      <AuthTextField
        label={t('paymentMethods.fieldNumber')}
        value={numberDisplay}
        onChangeText={onNumberChange}
        placeholder={t('paymentMethods.phNumber')}
        keyboardType="number-pad"
        autoCorrect={false}
      />
      <AuthTextField
        label={t('paymentMethods.fieldCardholder')}
        value={nameOnCard}
        onChangeText={setNameOnCard}
        placeholder={t('paymentMethods.phCardholder')}
        autoCapitalize="words"
      />
      <View style={row2}>
        <View style={half}>
          <AuthTextField
            label={t('paymentMethods.fieldExpiry')}
            value={expiry}
            onChangeText={onExpiryChange}
            placeholder={t('paymentMethods.phExpiry')}
            keyboardType="number-pad"
            autoCorrect={false}
          />
        </View>
        <View style={half}>
          <AuthTextField
            label={t('paymentMethods.fieldCvc')}
            value={cvc}
            onChangeText={onCvcChange}
            placeholder={t('paymentMethods.phCvc')}
            keyboardType="number-pad"
            secureTextEntry
            autoCorrect={false}
          />
        </View>
      </View>

      <PrimaryButton sheet title={t('paymentMethods.saveCard')} onPress={submit} />
    </PremiumScreen>
  );
}

const row2 = { flexDirection: 'row' as const, gap: spacing.sm };
const half = { flex: 1 };
