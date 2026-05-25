import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '@/api/http';
import { submitModerationReport } from '@/api/reportsApi';
import type { ModerationReportType } from '@/api/types';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { AppBackground } from '@/components/ui/AppBackground';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const REASON_VALUES = [
  'Spam or misleading content',
  'Harassment or abuse',
  'Safety concern',
  'Fraud or scam',
  'Stolen content / copyright',
  'Other',
] as const;

export type ReportIssueModalProps = {
  visible: boolean;
  onClose: () => void;
  targetType: ModerationReportType;
  /** Required for all types except OTHER (server accepts null for OTHER). */
  targetId: number | null;
  title?: string;
};

export function ReportIssueModal({ visible, onClose, targetType, targetId, title }: ReportIssueModalProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [reason, setReason] = useState<string>(REASON_VALUES[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonLabel = (value: string) => {
    const i = REASON_VALUES.indexOf(value as (typeof REASON_VALUES)[number]);
    const keys = [
      'report.reasons.spam',
      'report.reasons.abuse',
      'report.reasons.safety',
      'report.reasons.fraud',
      'report.reasons.ip',
      'report.reasons.other',
    ] as const;
    return i >= 0 ? t(keys[i]) : value;
  };

  const reset = () => {
    setReason(REASON_VALUES[0]);
    setDetails('');
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = () => {
    if (targetType !== 'OTHER' && targetId == null) {
      setError(t('report.missingTarget'));
      return;
    }
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await submitModerationReport({
          targetType,
          targetId: targetType === 'OTHER' ? undefined : targetId,
          reason,
          description: details.trim() || null,
        });
        reset();
        onClose();
        Alert.alert(t('common.ok'), t('report.success'));
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : t('common.error');
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <AppBackground>
        <View style={styles.wrap}>
        <Pressable style={styles.backdrop} onPress={handleClose} accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.handle} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <AppText variant="h2" color="text">
            {title ?? t('report.title')}
          </AppText>
          <AppText variant="caption" color="textMuted" style={styles.sub}>
            {t('report.reasonLabel')}
          </AppText>
          <View style={styles.reasonList}>
            {REASON_VALUES.map((v) => {
              const on = reason === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setReason(v)}
                  style={[styles.reasonRow, on && styles.reasonRowOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <AppText variant="body-em" color="text">
                    {reasonLabel(v)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="caption" color="textMuted" style={styles.gapTop}>
            {t('report.detailsLabel')}
          </AppText>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder={t('report.detailsPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          {error ? (
            <AppText variant="caption" color="error" style={styles.err}>
              {error}
            </AppText>
          ) : null}
          <PrimaryButton
            title={loading ? t('report.submitting') : t('report.submit')}
            onPress={() => submit()}
            loading={loading}
            style={styles.cta}
          />
          <SecondaryButton title={t('common.cancel')} onPress={handleClose} style={styles.cancel} />
        </ScrollView>
        </View>
        </View>
      </AppBackground>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 247, 251, 0.35)',
    },
    sheet: {
      maxHeight: '88%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      paddingHorizontal: spacing.screen,
      paddingTop: spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
    },
    scroll: { paddingBottom: spacing.lg, gap: spacing.sm },
    sub: { marginTop: spacing.xs },
    gapTop: { marginTop: spacing.md },
    reasonList: { gap: spacing.xs, marginTop: spacing.sm },
    reasonRow: {
      padding: spacing.md,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    reasonRowOn: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    input: {
      minHeight: 100,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      padding: spacing.md,
      color: colors.text,
      backgroundColor: colors.card,
      textAlignVertical: 'top',
    },
    err: { marginTop: spacing.xs },
    cta: { marginTop: spacing.md },
    cancel: { marginTop: spacing.sm },
  });
}
