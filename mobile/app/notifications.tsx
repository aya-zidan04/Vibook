import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radii, spacing } from '@/theme';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const ITEMS = [
    { titleKey: 'notifications.n1Title', bodyKey: 'notifications.n1Body', timeKey: 'notifications.time1' },
    { titleKey: 'notifications.n2Title', bodyKey: 'notifications.n2Body', timeKey: 'notifications.time2' },
  ];

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('notifications.title')} />
      {ITEMS.map((n, i) => (
        <View key={i} style={styles.card}>
          <AppText variant="bodyMedium" color="text">
            {t(n.titleKey)}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {t(n.bodyKey)}
          </AppText>
          <AppText variant="meta" color="textMuted">
            {t(n.timeKey)}
          </AppText>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.md },
  card: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
});
