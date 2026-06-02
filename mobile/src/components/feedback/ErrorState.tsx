import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing, useThemeColors } from '@/theme';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: Props) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(), []);

  const displayTitle = title ?? t('common.errorDefaultTitle');
  const displayMessage = message ?? t('common.errorDefaultMessage');

  return (
    <View style={styles.wrap}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.error} />
      <AppText variant="h3" color="text" style={styles.title}>
        {displayTitle}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.msg}>
        {displayMessage}
      </AppText>
      {onRetry ? (
        <SecondaryButton title={t('common.retry')} onPress={onRetry} style={styles.btn} />
      ) : null}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.xxl,
    },
    title: { marginTop: spacing.md, textAlign: 'center' },
    msg: { marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 },
    btn: { marginTop: spacing.lg, alignSelf: 'stretch' },
  });
}
