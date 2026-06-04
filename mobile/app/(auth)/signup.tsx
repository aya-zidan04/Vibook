import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthTextField, PasswordToggleIcon } from '@/components/auth/AuthTextField';
import { JordanPhoneField } from '@/components/auth/JordanPhoneField';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { registerRequest } from '@/api/authApi';
import { saveAuthResponse } from '@/api/authSession';
import { mapApiError } from '@/utils/mapApiError';
import { useAppStore } from '@/store/appStore';
import { useSessionStore } from '@/store/sessionStore';
import {
  isValidEmail,
  isValidJordanLocalPhone,
  isValidSignupPassword,
} from '@/utils/authValidation';
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

  const goLogin = () => {
    router.replace('/login');
  };

  const onCreate = () => {
    if (!canCreate || busy) return;
    setBusy(true);
    void (async () => {
      try {
        const phoneE164 = `+962${digitsOnly}`;
        const auth = await registerRequest({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phone: phoneE164,
        });
        await saveAuthResponse(auth);
        useSessionStore.getState().setSessionFromAuthResponse(auth.user);
        setAuthenticated(true);
        setGuest(false);
        setHasCompletedOnboarding(true);
        router.replace('/(tabs)/explore');
      } catch (e) {
        Alert.alert(t('auth.signupTitle'), mapApiError(e, t));
      } finally {
        setBusy(false);
      }
    })();
  };

  const btnFull = { width: '100%' as const };

  return (
    <AuthScreenLayout onBack={goLogin}>
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
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        technicalInput
      />

      <AuthTextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.passwordMaskPlaceholder')}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        rightSlot={<PasswordToggleIcon visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
      />

      <JordanPhoneField
        label={t('auth.phone')}
        value={phone}
        onChangeText={onPhoneChange}
        placeholder={t('auth.phonePlaceholder')}
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
        <AppText variant="caption" color="textSecondary" style={styles.termsText}>
          {t('auth.agreePrefix')}{' '}
          <AppText
            variant="caption"
            color="primaryLight"
            style={styles.link}
            onPress={() => Alert.alert(t('auth.termsComingSoonTitle'), t('auth.termsComingSoonBody'))}
          >
            {t('auth.terms')}
          </AppText>{' '}
          {t('auth.and')}{' '}
          <AppText
            variant="caption"
            color="primaryLight"
            style={styles.link}
            onPress={() => Alert.alert(t('auth.privacy'), t('auth.termsComingSoonBody'))}
          >
            {t('auth.privacy')}
          </AppText>
          .
        </AppText>
      </Pressable>

      <PrimaryButton
        title={t('auth.createAccountSubmit')}
        onPress={onCreate}
        disabled={!canCreate || busy}
        style={{ ...btnFull, marginTop: spacing.sm }}
      />

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
    </AuthScreenLayout>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      marginBottom: spacing.lg,
    },
    nameRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    nameHalf: {
      flex: 1,
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      marginTop: spacing.xs,
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
    },
    link: {
      color: colors.primaryLight,
      textDecorationLine: 'underline',
    },
    browseLink: {
      alignSelf: 'center',
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
    },
    browseUnderline: {
      textDecorationLine: 'underline',
    },
  });
}
