import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthTextField, PasswordToggleIcon } from '@/components/auth/AuthTextField';
import { BusinessFieldIconSlot } from '@/components/business/businessFieldRow';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { loginRequest } from '@/api/authApi';
import { saveAuthResponse } from '@/api/authSession';
import { mapApiError } from '@/utils/mapApiError';
import { useAppStore } from '@/store/appStore';
import { useSessionStore } from '@/store/sessionStore';
import { canSubmitLogin } from '@/utils/authValidation';
import { useThemeStore } from '@/store/themeStore';
import { spacing, useThemeColors } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useThemeStore((s) => s.colorScheme) === 'dark';
  const dividerColor = isDark ? 'rgba(254, 254, 254, 0.24)' : colors.border;
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const setHasCompletedOnboarding = useAppStore((s) => s.setHasCompletedOnboarding);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setGuest = useAppStore((s) => s.setGuest);

  const canLogin = canSubmitLogin(email, password);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/entry');
  };

  const goSignup = () => {
    router.replace('/signup');
  };

  const onLogin = () => {
    if (!canLogin || busy) return;
    setBusy(true);
    void (async () => {
      try {
        const auth = await loginRequest(email, password);
        await saveAuthResponse(auth);
        useSessionStore.getState().setSessionFromAuthResponse(auth.user);
        setAuthenticated(true);
        setGuest(false);
        setHasCompletedOnboarding(true);
        router.replace('/(tabs)/explore');
      } catch (e) {
        Alert.alert(t('auth.loginToBrand'), mapApiError(e, t));
      } finally {
        setBusy(false);
      }
    })();
  };

  const onResetPassword = () => {
    /* mock — no server */
  };

  const btnFull = { width: '100%' as const };

  return (
    <AuthScreenLayout onClose={close}>
      <AppText variant="h1" color="text" style={styles.title}>
        {t('auth.loginToBrand')}
      </AppText>

      <AuthTextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        technicalInput
        leftSlot={
          <BusinessFieldIconSlot>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </BusinessFieldIconSlot>
        }
      />

      <AuthTextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        rightSlot={<PasswordToggleIcon visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
      />

      <Pressable onPress={onResetPassword} style={styles.resetWrap}>
        <AppText variant="caption" color="primaryLight" style={styles.resetText}>
          {t('auth.resetPassword')}
        </AppText>
      </Pressable>

      <PrimaryButton sheet title={t('auth.loginCta')} onPress={onLogin} disabled={!canLogin || busy} style={btnFull} />

      <View style={[styles.divider, { borderTopColor: dividerColor }]} />

      <SecondaryButton sheet title={t('auth.createAccountCta')} onPress={goSignup} style={btnFull} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.lg,
  },
  resetWrap: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  resetText: {
    textDecorationLine: 'underline',
  },
  divider: {
    marginVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
