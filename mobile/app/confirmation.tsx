import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { useBookingDraftStore } from '@/store/bookingDraftStore';

export default function ConfirmationScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const orderId = useBookingDraftStore((s) => s.lastOrderId);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color={colors.accent} />
        </View>
        <AppText variant="h1" color="text" style={styles.title}>
          {t('confirmation.title')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.sub}>
          {t('confirmation.body')}
        </AppText>
        {orderId ? (
          <View style={styles.orderBox}>
            <AppText variant="caption" color="textMuted">
              {t('confirmation.orderRef')}
            </AppText>
            <AppText variant="h2" color="text">
              {orderId}
            </AppText>
          </View>
        ) : null}
        <PrimaryButton title={t('confirmation.viewBookings')} onPress={() => router.replace('/(tabs)/booking')} />
        <SecondaryButton
          title={t('confirmation.backHome')}
          onPress={() => router.replace('/(tabs)/explore')}
          style={styles.second}
        />
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: spacing.screen, justifyContent: 'center', gap: spacing.lg },
  iconWrap: { alignItems: 'center' },
  title: { textAlign: 'center' },
  sub: { textAlign: 'center', lineHeight: 24 },
  orderBox: {
    alignSelf: 'stretch',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  second: { marginTop: spacing.sm },
});

}
