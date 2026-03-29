import { useState } from 'react';
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n/useTranslation';
import type { AppLocale, DisplayCurrency } from '@/store/localeStore';
import { useLocaleStore } from '@/store/localeStore';
import { colors } from '@/theme';

type Tab = 'language' | 'currency';

const LANG_IDS: AppLocale[] = ['en', 'ar'];
const CUR_IDS: DisplayCurrency[] = ['JOD', 'USD'];

export default function LanguageCurrencyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const currency = useLocaleStore((s) => s.currency);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const setCurrency = useLocaleStore((s) => s.setCurrency);
  const [tab, setTab] = useState<Tab>('language');
  const rtl = I18nManager.isRTL;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name={rtl ? 'chevron-forward' : 'chevron-back'} size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>{t('languageCurrency.pageTitle')}</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('language')} style={styles.tabBtn}>
          <Text style={[styles.tabLabel, tab === 'language' ? styles.tabActive : styles.tabInactive]}>
            {t('languageCurrency.tabLanguage')}
          </Text>
          {tab === 'language' ? <View style={styles.tabUnderline} /> : <View style={styles.tabUnderlineHidden} />}
        </Pressable>
        <Pressable onPress={() => setTab('currency')} style={styles.tabBtn}>
          <Text style={[styles.tabLabel, tab === 'currency' ? styles.tabActive : styles.tabInactive]}>
            {t('languageCurrency.tabCurrency')}
          </Text>
          {tab === 'currency' ? <View style={styles.tabUnderline} /> : <View style={styles.tabUnderlineHidden} />}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'language'
          ? LANG_IDS.map((id) => (
              <OptionCard
                key={id}
                title={id === 'en' ? t('languageCurrency.english') : t('languageCurrency.arabic')}
                subtitle={id === 'en' ? t('languageCurrency.enCode') : t('languageCurrency.arCode')}
                selected={locale === id}
                onSelect={() => setLocale(id)}
              />
            ))
          : CUR_IDS.map((id) => (
              <OptionCard
                key={id}
                title={id === 'JOD' ? t('languageCurrency.jodTitle') : t('languageCurrency.usdTitle')}
                subtitle={id === 'JOD' ? t('languageCurrency.jodCode') : t('languageCurrency.usdCode')}
                selected={currency === id}
                onSelect={() => setCurrency(id)}
              />
            ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionCard({
  title,
  subtitle,
  selected,
  onSelect,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardIdle,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      {selected ? (
        <View style={styles.checkBubble}>
          <Ionicons name="checkmark" size={16} color={colors.plum} />
        </View>
      ) : (
        <View style={styles.radioOutline} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  back: {
    padding: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pageTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 12,
    letterSpacing: -0.3,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 28,
  },
  tabBtn: {
    paddingBottom: 10,
    minWidth: 100,
  },
  tabLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  tabActive: { color: colors.text },
  tabInactive: { color: colors.textMuted },
  tabUnderline: {
    marginTop: 10,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  tabUnderlineHidden: {
    marginTop: 10,
    height: 3,
    opacity: 0,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardSelected: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  cardIdle: {
    backgroundColor: colors.surface,
    borderColor: 'transparent',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  checkBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOutline: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.beige,
  },
});
