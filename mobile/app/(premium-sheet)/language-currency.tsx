import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { PremiumSheetPickCard } from '@/components/sheet/PremiumSheetPickCard';
import { useTranslation } from '@/i18n/useTranslation';
import { reloadAppForLocaleChange } from '@/utils/reloadApp';
import { useLocaleStore, type AppLocale, type DisplayCurrency } from '@/store/localeStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Tab = 'language' | 'currency';

const LANG_IDS: AppLocale[] = ['en', 'ar'];
const CUR_IDS: DisplayCurrency[] = ['JOD', 'USD'];

export default function LanguageCurrencyScreen() {
  const colors = useThemeColors();
  const tabStyles = useMemo(() => createTabStyles(colors), [colors]);
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const currency = useLocaleStore((s) => s.currency);
  const regionLabel = useLocaleStore((s) => s.regionLabel);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const setCurrency = useLocaleStore((s) => s.setCurrency);
  const [tab, setTab] = useState<Tab>('language');
  const [reloading, setReloading] = useState(false);

  const onSelectLocale = (id: AppLocale) => {
    if (id === locale || reloading) return;
    const nextCurrency: DisplayCurrency = id === 'ar' ? 'JOD' : currency;
    setLocale(id);
    setReloading(true);
    void reloadAppForLocaleChange(id, nextCurrency, regionLabel);
  };

  const languageOptions = useMemo(
    () =>
      LANG_IDS.map((id) => ({
        id,
        title: id === 'en' ? t('languageCurrency.english') : t('languageCurrency.arabic'),
        subtitle: id === 'en' ? t('languageCurrency.enCode') : t('languageCurrency.arCode'),
        writingDirection: (id === 'ar' ? 'rtl' : 'ltr') as 'ltr' | 'rtl',
      })),
    [t],
  );

  const currencyOptions = useMemo(
    () =>
      CUR_IDS.map((id) => ({
        id,
        title: id === 'JOD' ? t('languageCurrency.jodTitle') : t('languageCurrency.usdTitle'),
        subtitle: id === 'JOD' ? t('languageCurrency.jodCode') : t('languageCurrency.usdCode'),
      })),
    [t],
  );

  return (
    <PremiumScreen title={t('languageCurrency.pageTitle')}>
      <View style={tabStyles.tabs}>
        <Pressable onPress={() => setTab('language')} style={tabStyles.tabBtn}>
          <AppText variant="h3" color={tab === 'language' ? 'text' : 'textMuted'} style={tabStyles.tabLabel}>
            {t('languageCurrency.tabLanguage')}
          </AppText>
          {tab === 'language' ? <View style={tabStyles.tabUnderline} /> : <View style={tabStyles.tabUnderlineHidden} />}
        </Pressable>
        <Pressable onPress={() => setTab('currency')} style={tabStyles.tabBtn}>
          <AppText variant="h3" color={tab === 'currency' ? 'text' : 'textMuted'} style={tabStyles.tabLabel}>
            {t('languageCurrency.tabCurrency')}
          </AppText>
          {tab === 'currency' ? <View style={tabStyles.tabUnderline} /> : <View style={tabStyles.tabUnderlineHidden} />}
        </Pressable>
      </View>

      <View style={tabStyles.list}>
        {tab === 'language'
          ? languageOptions.map((opt) => (
              <PremiumSheetPickCard
                key={opt.id}
                title={opt.title}
                subtitle={opt.subtitle}
                selected={locale === opt.id}
                onPress={() => onSelectLocale(opt.id)}
                accessibilityLabel={opt.title}
                writingDirection={opt.writingDirection}
              />
            ))
          : currencyOptions.map((opt) => (
              <PremiumSheetPickCard
                key={opt.id}
                title={opt.title}
                subtitle={opt.subtitle}
                selected={currency === opt.id}
                onPress={() => setCurrency(opt.id)}
                accessibilityLabel={opt.title}
              />
            ))}
      </View>
    </PremiumScreen>
  );
}

function createTabStyles(colors: ThemeColors) {
  return StyleSheet.create({
    tabs: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 40,
      marginBottom: spacing.xs,
    },
    tabBtn: {
      alignItems: 'center',
      paddingBottom: 10,
      minWidth: 88,
    },
    tabLabel: { textAlign: 'center' },
    tabUnderline: {
      alignSelf: 'center',
      marginTop: 10,
      height: 3,
      width: '72%',
      minWidth: 48,
      maxWidth: 120,
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    tabUnderlineHidden: { marginTop: 10, height: 3, opacity: 0 },
    list: { gap: spacing.md },
  });
}
