import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { mapApiError } from '@/utils/mapApiError';
import { submitUserReport } from '@/api/userReportsApi';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { spacing, useThemeColors } from '@/theme';

export default function ReportProblemScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const inputStyles = useMemo(() => createInputStyles(colors), [colors]);
  const { t } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!isAuthenticated) {
      Alert.alert(t('common.error'), t('problemReport.signInRequired'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.loginCta'), onPress: () => router.push('/login') },
      ]);
      return;
    }

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    let hasError = false;

    if (!trimmedSubject) {
      setSubjectError(t('problemReport.subjectRequired'));
      hasError = true;
    } else {
      setSubjectError(null);
    }

    if (!trimmedMessage) {
      setMessageError(t('problemReport.messageRequired'));
      hasError = true;
    } else {
      setMessageError(null);
    }

    if (hasError) return;

    setLoading(true);
    setSubmitError(null);
    void (async () => {
      try {
        await submitUserReport({ subject: trimmedSubject, message: trimmedMessage });
        setSubmitted(true);
        setSubject('');
        setMessage('');
        Alert.alert(t('problemReport.successTitle'), t('problemReport.successBody'));
      } catch (e) {
        setSubmitError(mapApiError(e, t));
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <PremiumScreen title={t('problemReport.title')}>
      <View style={styles.sectionGap}>
        <AppText variant="body" color="textSecondary">
          {t('problemReport.description')}
        </AppText>

        {submitted ? (
          <View style={styles.insetCard}>
            <AppText variant="body-em" color="primary">
              {t('problemReport.successTitle')}
            </AppText>
            <AppText variant="body" color="textSecondary">
              {t('problemReport.successBody')}
            </AppText>
          </View>
        ) : null}

        <AppText variant="caption" color="textMuted">
          {t('problemReport.subjectLabel')}
        </AppText>
        <TextInput
          value={subject}
          onChangeText={(text) => {
            setSubject(text);
            if (subjectError) setSubjectError(null);
          }}
          placeholder={t('problemReport.subjectPlaceholder')}
          placeholderTextColor={colors.placeholder}
          editable={!loading}
          style={styles.input}
        />
        {subjectError ? (
          <AppText variant="caption" color="error">
            {subjectError}
          </AppText>
        ) : null}

        <AppText variant="caption" color="textMuted">
          {t('problemReport.messageLabel')}
        </AppText>
        <TextInput
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            if (messageError) setMessageError(null);
          }}
          placeholder={t('problemReport.messagePlaceholder')}
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={6}
          editable={!loading}
          style={[styles.input, inputStyles.textArea]}
        />
        {messageError ? (
          <AppText variant="caption" color="error">
            {messageError}
          </AppText>
        ) : null}
        {submitError ? (
          <AppText variant="caption" color="error">
            {submitError}
          </AppText>
        ) : null}
        <PrimaryButton
          title={loading ? t('problemReport.submitting') : t('problemReport.submit')}
          onPress={submit}
          loading={loading}
          style={styles.sheetButton}
        />
      </View>
    </PremiumScreen>
  );
}

function createInputStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    textArea: {
      minHeight: 140,
      textAlignVertical: 'top',
      paddingTop: spacing.md,
      color: colors.text,
    },
  });
}
