import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextField, PasswordToggleIcon } from '@/components/auth/AuthTextField';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { isApiConfigured } from '@/config/api';
import { authApi } from '@/services/auth/authApi';
import { applyAuthResponse } from '@/services/auth/session';
import { useAppStore } from '@/store/appStore';
import { useLocaleStore } from '@/store/localeStore';
import { formatApiErrorMessage } from '@/utils/apiError';
import {
  isValidEmail,
  isValidJordanLocalPhone,
  isValidSignupPassword,
} from '@/utils/authValidation';
import { ltrNavigationChrome } from '@/utils/navigationChrome';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

function canSubmitSignup(
  first: string,
  last: string,
  email: string,
  password: string,
  phoneDigits: string,
  terms: boolean,
): boolean {
  return (
    first.trim().length > 0 &&
    last.trim().length > 0 &&
    isValidEmail(email) &&
    isValidSignupPassword(password) &&
    isValidJordanLocalPhone(phoneDigits) &&
    terms
  );
}

export default function SignupScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  const setHasCompletedOnboarding = useAppStore((s) => s.setHasCompletedOnboarding);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setGuest = useAppStore((s) => s.setGuest);

  const digitsOnly = phone.replace(/\D/g, '').slice(-9);
  const canCreate = canSubmitSignup(firstName, lastName, email, password, digitsOnly, terms);

  const onPhoneChange = (text: string) => {
    const d = text.replace(/\D/g, '').slice(0, 9);
    setPhone(d);
  };

  const onCreate = async () => {
    if (!canCreate || busy) return;
    if (!isApiConfigured()) {
      setAuthenticated(true);
      setGuest(false);
      setHasCompletedOnboarding(true);
      router.replace('/(tabs)/explore');
      return;
    }
    setBusy(true);
    try {
      const locale = useLocaleStore.getState().locale;
      const auth = await authApi.register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: `+962${digitsOnly}`,
        preferredLanguage: locale === 'ar' ? 'AR' : 'EN',
      });
      await applyAuthResponse(auth);
      router.replace('/(tabs)/explore');
    } catch (e) {
      Alert.alert(t('common.error'), formatApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const btnFull = { borderRadius: radii.lg, width: '100%' as const };

  return (
    <Screen scroll edges={['top', 'right', 'left', 'bottom']} contentStyle={styles.scroll}>
      <View style={ltrNavigationChrome}>
        <View style={styles.grabber} />

        <Pressable
          onPress={() => router.back()}
          style={styles.backRow}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
      </View>

      <AppText variant="h1" color="text" style={styles.title}>
        {t('auth.signupTitle')}
      </AppText>

      <View style={styles.nameRow}>
        <View style={styles.nameHalf}>
          <AuthTextField
            label={t('auth.firstName')}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t('auth.firstName')}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.nameHalf}>
          <AuthTextField
            label={t('auth.lastName')}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t('auth.lastName')}
            autoCapitalize="words"
          />
        </View>
      </View>

      <AuthTextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.emailPlaceholder')}
        helper={t('auth.emailHelper')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <AuthTextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        helper={t('auth.passwordHelper')}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        rightSlot={<PasswordToggleIcon visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
      />

      <AuthTextField
        label={t('auth.phone')}
        value={phone}
        onChangeText={onPhoneChange}
        placeholder={t('auth.phonePlaceholder')}
        keyboardType="number-pad"
        autoCorrect={false}
        textInputStyle={styles.phoneInput}
        leftSlot={
          <View style={styles.phonePrefix}>
            <AppText variant="bodyMedium" style={styles.flag}>
              🇯🇴
            </AppText>
            <AppText variant="bodyMedium" color="textSecondary">
              +962
            </AppText>
            <View style={styles.phoneSep} />
          </View>
        }
      />

      <Pressable
        onPress={() => setTerms(!terms)}
        style={styles.termsRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: terms }}
      >
        <View style={[styles.checkbox, terms && styles.checkboxOn]}>
          {terms ? <Ionicons name="checkmark" size={16} color={colors.text} /> : null}
        </View>
        <Text style={styles.termsText}>
          {t('auth.agreePrefix')}{' '}
          <Text style={styles.link} onPress={() => Alert.alert(t('auth.termsMockTitle'), t('auth.termsMockBody'))}>
            {t('auth.terms')}
          </Text>{' '}
          {t('auth.and')}{' '}
          <Text style={styles.link} onPress={() => Alert.alert(t('auth.privacy'), t('auth.termsMockBody'))}>
            {t('auth.privacy')}
          </Text>
          .
        </Text>
      </Pressable>

      <PrimaryButton
        title={t('auth.createAccountSubmit')}
        onPress={() => void onCreate()}
        disabled={!canCreate || busy}
        style={{ ...btnFull, marginTop: spacing.md }}
      />
      {busy ? (
        <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.accent} />
      ) : null}

      <Pressable
        onPress={() => {
          setGuest(true);
          setAuthenticated(false);
          setHasCompletedOnboarding(true);
          router.replace('/(tabs)/explore');
        }}
        style={styles.browseLink}
      >
        <AppText variant="caption" color="textMuted" style={styles.browseUnderline}>
          {t('auth.browseFirstLink')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  scroll: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
    marginBottom: spacing.md,
    opacity: 0.85,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xl,
    letterSpacing: -0.3,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 0,
  },
  nameHalf: {
    flex: 1,
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: spacing.sm,
  },
  flag: {
    fontSize: 20,
  },
  phoneSep: {
    width: 1,
    height: 26,
    backgroundColor: colors.border,
  },
  phoneInput: {
    // Keep phone numerals LTR inside the field in RTL layouts
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.xs,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: colors.surface,
  },
  checkboxOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  termsText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  link: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  browseLink: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  browseUnderline: {
    textDecorationLine: 'underline',
  },
});

}
