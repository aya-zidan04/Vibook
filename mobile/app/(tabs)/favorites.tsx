import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { MOCK_EVENTS } from '@/services/mock';
import { spacing } from '@/theme';
import { EventCard } from '@/components';

export default function FavoritesTabScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Screen scroll contentStyle={styles.pad}>
      <AppText variant="h1" color="text" style={styles.title}>
        {t('favorites.title')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.sub}>
        {t('favorites.subtitle')}
      </AppText>
      {MOCK_EVENTS.slice(0, 3).map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
      <PrimaryButton title={t('favorites.discover')} onPress={() => router.push('/(tabs)/explore')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.md },
  title: { marginBottom: spacing.xs },
  sub: { lineHeight: 22, marginBottom: spacing.sm },
});
