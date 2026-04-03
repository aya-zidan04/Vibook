import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useIntegrationMode } from '@/hooks/useIntegrationMode';
import { useTranslation } from '@/i18n/useTranslation';
import { meNotificationsApi } from '@/services/api/meNotificationsApi';
import { ApiRequestError } from '@/services/api/http';
import type { NotificationItem } from '@/types';
import { notificationResponseToItem } from '@/utils/meFeatureMappers';
import { formatDateShort } from '@/utils/format';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const MOCK_KEYS: { titleKey: string; bodyKey: string; timeKey: string }[] = [
  { titleKey: 'notifications.n1Title', bodyKey: 'notifications.n1Body', timeKey: 'notifications.time1' },
  { titleKey: 'notifications.n2Title', bodyKey: 'notifications.n2Body', timeKey: 'notifications.time2' },
];

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { api, authenticated, liveAccount } = useIntegrationMode();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readAllBusy, setReadAllBusy] = useState(false);

  const load = useCallback(async () => {
    if (!liveAccount) {
      setItems([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await meNotificationsApi.list();
      setItems(res.notifications.map(notificationResponseToItem));
    } catch (e) {
      setItems([]);
      setError(e instanceof ApiRequestError ? e.message : t('notifications.loadError'));
    } finally {
      setLoading(false);
    }
  }, [liveAccount, t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const markRead = async (id: string) => {
    try {
      await meNotificationsApi.patch(id, { read: true });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      void load();
    }
  };

  const markAllRead = async () => {
    setReadAllBusy(true);
    try {
      await meNotificationsApi.readAll();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      void load();
    } finally {
      setReadAllBusy(false);
    }
  };

  if (api && !authenticated) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('notifications.title')} />
        <EmptyState
          icon="notifications-outline"
          title={t('notifications.signInTitle')}
          description={t('notifications.signInDesc')}
          actionLabel={t('entry.loginSignup')}
          onAction={() => router.push('/(auth)/login')}
        />
      </Screen>
    );
  }

  if (!api) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('notifications.title')} />
        {MOCK_KEYS.map((n, i) => (
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

  if (loading && items.length === 0 && !error) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('notifications.title')} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error && items.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('notifications.title')} />
        <AppText variant="body" color="error" style={styles.err}>
          {error}
        </AppText>
        <PrimaryButton title={t('common.retry')} onPress={() => void load()} />
      </Screen>
    );
  }

  const hasUnread = items.some((n) => !n.read);

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader
        title={t('notifications.title')}
        right={
          hasUnread ? (
            <Pressable
              onPress={() => void markAllRead()}
              disabled={readAllBusy}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed || readAllBusy ? 0.5 : 1 }]}
            >
              <AppText variant="meta" color="accent">
                {readAllBusy ? t('common.loading') : t('notifications.markAllRead')}
              </AppText>
            </Pressable>
          ) : undefined
        }
      />
      {error ? (
        <AppText variant="caption" color="warning" style={styles.warn}>
          {error}
        </AppText>
      ) : null}
      {items.length === 0 ? (
        <EmptyState icon="notifications-outline" title={t('notifications.emptyTitle')} description={t('notifications.emptyDesc')} />
      ) : (
        items.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => {
              if (!n.read) void markRead(n.id);
            }}
            style={[styles.card, !n.read && styles.cardUnread]}
          >
            {!n.read ? <View style={styles.dot} /> : null}
            <AppText variant="bodyMedium" color="text">
              {n.title}
            </AppText>
            <AppText variant="body" color="textSecondary">
              {n.body}
            </AppText>
            <AppText variant="meta" color="textMuted">
              {formatDateShort(n.createdAt, locale)}
            </AppText>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    center: { paddingVertical: 40, alignItems: 'center' },
    err: { marginBottom: spacing.sm },
    warn: { marginBottom: spacing.xs },
    card: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    cardUnread: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
      marginBottom: 4,
    },
  });
}
