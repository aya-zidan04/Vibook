import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { UserRatingBlock } from '@/components/ui/StarRatingInput';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { formatDecimalForLocale, formatIntForLocale } from '@/utils/format';
import { chevronForwardTrailing } from '@/utils/rtl';
import { useOrganizerPdp } from '@/hooks/useCatalogPdp';
import { getCityName } from '@/services/mock';
import { fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function OrganizerScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const { organizer: org, events, loading } = useOrganizerPdp(id);

  if (loading) {
    return (
      <Screen>
        <DetailHeader title={t('organizer.title')} />
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!org) {
    return (
      <Screen>
        <DetailHeader title={t('organizer.title')} />
        <AppText color="textSecondary">{t('organizer.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cover}>
          <Image source={{ uri: org.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={[fadeFromBackground(colors, 0.2), colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.coverHeader}>
            <DetailHeader />
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.headRow}>
            <Image source={{ uri: org.logoUrl }} style={styles.logo} />
            <View style={{ flex: 1 }}>
              <AppText variant="h1" color="text">
                {org.name}
              </AppText>
              <View style={styles.row}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <AppText variant="bodyMedium" color="textSecondary">
                  {formatDecimalForLocale(org.rating, locale, 1)} · {formatIntForLocale(org.reviewCount, locale)}{' '}
                  {t('event.reviewsWord')}
                </AppText>
                {org.verified ? (
                  <AppText variant="meta" color="accent">
                    {' '}
                    · {t('organizer.verifiedBadge')}
                  </AppText>
                ) : null}
              </View>
            </View>
          </View>
          <UserRatingBlock vertical="organizer" refId={org.id} />
          <AppText variant="body" color="textSecondary" style={styles.about}>
            {org.about}
          </AppText>
          <AppText variant="h3" color="text" style={styles.section}>
            {t('organizer.events')}
          </AppText>
          {events.map((e) => (
            <Pressable key={e.id} style={styles.eventRow} onPress={() => router.push(`/event/${e.id}`)}>
              <Image source={{ uri: e.imageUrl }} style={styles.eventImg} contentFit="cover" />
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="bodyMedium" color="text" numberOfLines={2}>
                  {e.title}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {[e.venueName, getCityName(e.cityId, locale)].filter(Boolean).join(' · ')}
                </AppText>
                <AppText variant="price" color="accent">
                  {t('common.from')} {formatMoney(e.priceFrom, e.currency)}
                </AppText>
              </View>
              <Ionicons name={chevronForwardTrailing()} size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  cover: { height: 200 },
  coverHeader: { paddingHorizontal: spacing.screen, paddingTop: spacing.sm },
  body: { padding: spacing.screen, gap: spacing.md },
  headRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  logo: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  about: { lineHeight: 24 },
  section: { marginTop: spacing.sm },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  eventImg: { width: 80, height: 80, borderRadius: radii.md },
  });
}
