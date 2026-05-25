import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { hideMyBusinessEvent, unhideMyBusinessEvent } from '@/api/businessEventsApi';
import { refreshBusinessHubLists } from '@/services/businessHubSync';
import { useBusinessHubStore } from '@/store/businessHubStore';
import type { BusinessEventRecord } from '@/types/businessHub';
import { minTicketPriceJod } from '@/utils/businessEventTickets';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function BusinessEventsIndexScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const events = useBusinessHubStore((s) => s.events);
  const [busyId, setBusyId] = useState<string | null>(null);

  const row = (item: BusinessEventRecord) => {
    const floor = minTicketPriceJod(item.ticketOptions);
    const priceLabel = item.ticketOptions.length > 0 && Number.isFinite(floor) ? String(floor) : '—';
    const capLabel = Number.isFinite(item.capacityGuests) ? String(item.capacityGuests) : '—';
    return (
      <View key={item.id} style={styles.card}>
        <Pressable
          onPress={() => router.push(`/business/events/${item.id}`)}
          style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}
        >
          <AppText variant="body-em" color="text">
            {item.title.trim() || t('businessHub.eventUntitled')}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {t('businessHub.eventMeta').replace('{price}', priceLabel).replace('{cap}', capLabel)}
          </AppText>
          {item.hidden ? (
            <AppText variant="label" color="textMuted">
              {t('businessHub.eventHidden')}
            </AppText>
          ) : null}
        </Pressable>
        <Pressable
          disabled={busyId === item.id}
          onPress={() => {
            const nid = Number(item.id);
            if (!Number.isFinite(nid)) {
              Alert.alert(t('common.error'), t('businessHub.missingEvent'));
              return;
            }
            setBusyId(item.id);
            void (async () => {
              try {
                if (item.hidden) {
                  await unhideMyBusinessEvent(nid);
                } else {
                  await hideMyBusinessEvent(nid);
                }
                await refreshBusinessHubLists();
              } catch {
                Alert.alert(t('common.error'), t('businessHub.eventSaveError'));
              } finally {
                setBusyId(null);
              }
            })();
          }}
          style={({ pressed }) => [styles.visibilityBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={item.hidden ? t('businessHub.eventShowPublic') : t('businessHub.eventHidePublic')}
        >
          <AppText variant="caption" color="accent">
            {item.hidden ? t('businessHub.eventShowPublic') : t('businessHub.eventHidePublic')}
          </AppText>
        </Pressable>
      </View>
    );
  };

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
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardMain: {
      padding: spacing.lg,
      gap: 4,
    },
    visibilityBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: 'center',
    },
    pressed: { opacity: 0.94 },
  });
}
