import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing } from '@/theme';

function digitsOnly(s: string, max: number): string {
  return s.replace(/\D/g, '').slice(0, max);
}

function formatGroupsOf4(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export default function AddPaymentMethodScreen() {
  const styles = useMemo(() => createStyles(), []);
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
    const cvcDigits = cvc.replace(/\D/g, '');
    if (cvcDigits.length < 3 || cvcDigits.length > 4) {
      Alert.alert(t('common.error'), t('paymentMethods.errCvc'));
      return;
    }

    Alert.alert(t('paymentMethods.addCardSuccessTitle'), t('paymentMethods.addCardSuccessBody'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll contentStyle={styles.pad} edges={['top', 'left', 'right', 'bottom']}>
      <DetailHeader title={t('paymentMethods.addAnother')} />
      <AppText variant="caption" color="textMuted" style={styles.intro}>
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
      <View style={styles.row2}>
        <View style={styles.half}>
          <AuthTextField
            label={t('paymentMethods.fieldExpiry')}
            value={expiry}
            onChangeText={onExpiryChange}
            placeholder={t('paymentMethods.phExpiry')}
            keyboardType="number-pad"
            autoCorrect={false}
          />
        </View>
        <View style={styles.half}>
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

      <PrimaryButton title={t('paymentMethods.saveCard')} onPress={submit} />
    </Screen>
  );
}

function createStyles() {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    intro: { lineHeight: 20, marginBottom: -spacing.xs },
    row2: { flexDirection: 'row', gap: spacing.sm },
    half: { flex: 1 },
  });
}
