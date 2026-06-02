import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { PremiumSheetCard } from '@/components/sheet/PremiumSheetCard';
import { PremiumSheetRow } from '@/components/sheet/PremiumSheetRow';
import { useTranslation } from '@/i18n/useTranslation';
import { useLocaleStore } from '@/store/localeStore';
import { useThemeStore } from '@/store/themeStore';
import { useThemeColors } from '@/theme';

export default function SettingsScreen() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const currency = useLocaleStore((s) => s.currency);

  const appearanceLabel =
    colorScheme === 'light' ? t('appearance.shortLight') : t('appearance.shortDark');
  const languageLabel =
    locale === 'ar' ? t('languageCurrency.arabic') : t('languageCurrency.english');

  const rows = useMemo(
    () => [
      {
        key: 'appearance',
        label: t('settings.appearance'),
        subtitle: appearanceLabel,
        icon: <Ionicons name="moon-outline" size={22} color={colors.primaryLight} />,
        href: '/appearance' as const,
      },
      {
        key: 'language',
        label: t('me.menuLanguage'),
        subtitle: `${languageLabel} · ${currency}`,
        icon: <Ionicons name="language-outline" size={22} color={colors.primaryLight} />,
        href: '/language-currency' as const,
      },
    ],
    [appearanceLabel, colors.primaryLight, currency, languageLabel, t],
  );

  return (
    <PremiumScreen title={t('settings.title')}>
      <PremiumSheetCard>
        {rows.map((row, index) => (
          <PremiumSheetRow
            key={row.key}
            divider={index > 0}
            title={row.label}
            subtitle={row.subtitle}
            icon={row.icon}
            onPress={() => router.push(row.href)}
            accessibilityLabel={row.label}
          />
        ))}
      </PremiumSheetCard>

      <AppText variant="caption" color="textMuted" style={{ marginTop: 8 }}>
        {t('settings.note')}
      </AppText>
    </PremiumScreen>
  );
}
