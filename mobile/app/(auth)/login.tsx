import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextField, PasswordToggleIcon } from '@/components/auth/AuthTextField';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { canSubmitLogin } from '@/utils/authValidation';
import { colors, radii, spacing } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const setHasCompletedOnboarding = useAppStore((s) => s.setHasCompletedOnboarding);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setGuest = useAppStore((s) => s.setGuest);

  const canLogin = canSubmitLogin(email, password);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/entry');
  };

  const onLogin = () => {
    if (!canLogin) return;
    setAuthenticated(true);
    setGuest(false);
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)/explore');
  };

  const browseWithoutAccount = () => {
    setGuest(true);
    setAuthenticated(false);
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)/explore');
  };

  const onResetPassword = () => {
    Alert.alert(t('auth.resetMockTitle'), t('auth.resetMockBody'));
  };

  const btnFull = { borderRadius: radii.lg, width: '100%' as const };

  return (
    <Screen scroll edges={['top', 'right', 'left', 'bottom']} contentStyle={styles.scroll}>
      <View style={styles.grabber} accessibilityLabel="Sheet handle" />

      <Pressable onPress={close} style={styles.closeRow} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
        <Ionicons name="close" size={28} color={colors.text} />
      </Pressable>

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

      <PrimaryButton title={t('auth.loginCta')} onPress={onLogin} disabled={!canLogin} style={btnFull} />

      <View style={styles.divider} />

      <SecondaryButton title={t('auth.createAccountCta')} onPress={() => router.push('/signup')} style={btnFull} />

      <Pressable onPress={browseWithoutAccount} style={styles.browseLink}>
        <AppText variant="caption" color="textMuted" style={styles.browseText}>
          {t('auth.browseFirstLink')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  closeRow: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xl,
    letterSpacing: -0.3,
  },
  resetWrap: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  resetText: {
    textDecorationLine: 'underline',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  browseLink: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  browseText: {
    textDecorationLine: 'underline',
  },
});
