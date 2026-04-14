import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import type { BusinessEventRecord } from '@/types/businessHub';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function BusinessEventsIndexScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const events = useBusinessHubStore((s) => s.events);

  const row = (item: BusinessEventRecord) => (
    <Pressable
      key={item.id}
      onPress={() => router.push(`/business/events/${item.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <AppText variant="bodyMedium" color="text">
        {item.title.trim() || t('businessHub.eventUntitled')}
      </AppText>
      <AppText variant="caption" color="textSecondary">
        {t('businessHub.eventMeta')
          .replace('{price}', item.price || '—')
          .replace('{cap}', item.capacity || '—')}
      </AppText>
      {item.hidden ? (
        <AppText variant="meta" color="textMuted">
          {t('businessHub.eventHidden')}
        </AppText>
      ) : null}
    </Pressable>
  );

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={
        <View style={styles.header}>
          <AppText variant="h2" color="text">
            {t('businessHub.eventsTitle')}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {t('businessHub.eventsLead')}
          </AppText>
        </View>
      }
    >
      <PrimaryButton title={t('businessHub.eventAdd')} onPress={() => router.push('/business/events/new')} />
      {events.length === 0 ? (
        <AppText variant="body" color="textMuted">
          {t('businessHub.eventsEmpty')}
        </AppText>
      ) : (
        <View style={styles.list}>{events.map(row)}</View>
      )}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
    header: { paddingTop: spacing.md, paddingHorizontal: spacing.screen, gap: spacing.xs },
    list: { gap: spacing.sm },
    card: {
      padding: spacing.lg,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    pressed: { opacity: 0.94 },
  });
}
