import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthSheetLayout } from '@/components/auth/AuthSheetLayout';
import { AuthTextField, PasswordToggleIcon } from '@/components/auth/AuthTextField';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { loginRequest } from '@/api/authApi';
import { saveAuthResponse } from '@/api/authSession';
import { ApiError } from '@/api/http';
import { useAppStore } from '@/store/appStore';
import { useSessionStore } from '@/store/sessionStore';
import { canSubmitLogin } from '@/utils/authValidation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const options: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  animation: 'slide_from_bottom',
  gestureEnabled: true,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
        const msg = e instanceof ApiError ? e.message : t('common.error');
        Alert.alert(t('auth.loginToBrand'), msg);
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
    <AuthSheetLayout onClose={close}>
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
        <AppText variant="caption" color="accent" style={styles.resetText}>
          {t('auth.resetPassword')}
        </AppText>
      </Pressable>

      <PrimaryButton sheet title={t('auth.loginCta')} onPress={onLogin} disabled={!canLogin || busy} style={btnFull} />

      <View style={[styles.divider, { borderTopColor: colors.border }]} />

      <SecondaryButton sheet title={t('auth.createAccountCta')} onPress={() => router.push('/signup')} style={btnFull} />
    </AuthSheetLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xl,
  },
  resetWrap: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  resetText: {
    textDecorationLine: 'underline',
  },
  divider: {
    marginVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
