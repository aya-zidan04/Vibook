import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { isValidEmail } from '@/utils/authValidation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const MAX = {
  company: 300,
  email: 255,
  phone: 32,
  category: 120,
  message: 4000,
} as const;

function isValidBusinessPhone(raw: string): boolean {
  const t = raw.trim();
  return t.length >= 6 && t.length <= MAX.phone;
}

type FieldKey = 'companyName' | 'email' | 'phone' | 'category' | 'message';

export default function BusinessJoinScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t, isRTL } = useTranslation();

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const clearError = (k: FieldKey) => {
    setErrors((e) => {
      const next = { ...e };
      delete next[k];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!companyName.trim()) next.companyName = t('businessJoin.errRequired');
    else if (companyName.trim().length > MAX.company) next.companyName = t('businessJoin.errTooLong');

    if (!email.trim()) next.email = t('businessJoin.errRequired');
    else if (!isValidEmail(email)) next.email = t('businessJoin.errEmail');
    else if (email.trim().length > MAX.email) next.email = t('businessJoin.errTooLong');

    if (!isValidBusinessPhone(phone)) {
      next.phone = phone.trim() ? t('businessJoin.errPhone') : t('businessJoin.errRequired');
    }

    if (!category.trim()) next.category = t('businessJoin.errRequired');
    else if (category.trim().length > MAX.category) next.category = t('businessJoin.errTooLong');

    if (message.trim().length > MAX.message) next.message = t('businessJoin.errTooLong');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setSubmitError(null);
    if (!validate() || busy) return;

    const body = {
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      category: category.trim(),
      message: message.trim() || t('businessJoin.messageDefault'),
    };

    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 550));
      router.replace('/business/success');
    } catch {
      setSubmitError(t('businessJoin.errSubmit'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.pad} edges={['top', 'left', 'right', 'bottom']}>
      <DetailHeader title={t('businessJoin.title')} />
      <AppText variant="body" color="textSecondary">
        {t('businessJoin.subtitle')}
      </AppText>

      <AuthTextField
        label={t('businessJoin.company')}
        placeholder={t('businessJoin.companyPh')}
        value={companyName}
        onChangeText={(v) => {
          setCompanyName(v);
          clearError('companyName');
        }}
        autoCapitalize="words"
      />
      {errors.companyName ? (
        <AppText variant="meta" color="error" style={styles.inlineErr}>
          {errors.companyName}
        </AppText>
      ) : null}

      <AuthTextField
        label={t('businessJoin.email')}
        placeholder={t('businessJoin.emailPh')}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          clearError('email');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.email ? (
        <AppText variant="meta" color="error" style={styles.inlineErr}>
          {errors.email}
        </AppText>
      ) : null}

      <AuthTextField
        label={t('businessJoin.phone')}
        placeholder={t('businessJoin.phonePh')}
        value={phone}
        onChangeText={(v) => {
          setPhone(v);
          clearError('phone');
        }}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      {errors.phone ? (
        <AppText variant="meta" color="error" style={styles.inlineErr}>
          {errors.phone}
        </AppText>
      ) : null}

      <AuthTextField
        label={t('businessJoin.category')}
        placeholder={t('businessJoin.categoryPh')}
        value={category}
        onChangeText={(v) => {
          setCategory(v);
          clearError('category');
        }}
        autoCapitalize="sentences"
      />
      {errors.category ? (
        <AppText variant="meta" color="error" style={styles.inlineErr}>
          {errors.category}
        </AppText>
      ) : null}

      <View style={styles.msgBlock}>
        <AppText variant="caption" color="text" style={styles.msgLabel}>
          {t('businessJoin.message')}
        </AppText>
        <AppText variant="meta" color="textMuted" style={styles.optional}>
          {t('businessJoin.messageOptional')}
        </AppText>
        <TextInput
          value={message}
          onChangeText={(v) => {
            setMessage(v);
            clearError('message');
          }}
          placeholder={t('businessJoin.messagePh')}
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          textAlign={isRTL ? 'right' : 'left'}
          style={[
            styles.msgInput,
            { writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr' },
          ]}
        />
        {errors.message ? (
          <AppText variant="meta" color="error" style={styles.inlineErr}>
            {errors.message}
          </AppText>
        ) : null}
      </View>

      {submitError ? (
        <AppText variant="body" color="error" style={styles.bannerErr}>
          {submitError}
        </AppText>
      ) : null}

      <PrimaryButton title={t('businessJoin.submit')} onPress={() => void submit()} loading={busy} />

      <AppText variant="caption" color="textMuted" style={styles.disclaimer}>
        {t('businessJoin.disclaimerMock')}
      </AppText>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: 0, paddingBottom: spacing.xxxl },
    inlineErr: { marginTop: -spacing.sm, marginBottom: spacing.sm },
    msgBlock: { marginBottom: spacing.md, gap: 6 },
    msgLabel: { fontWeight: '600' },
    optional: { marginBottom: 2 },
    msgInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text,
      backgroundColor: colors.surface,
      fontSize: 16,
      minHeight: 120,
    },
    bannerErr: { marginBottom: spacing.sm, lineHeight: 22 },
    disclaimer: { lineHeight: 18, marginTop: spacing.sm },
  });
}
