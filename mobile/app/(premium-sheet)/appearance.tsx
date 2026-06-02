import { useMemo } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { PremiumSheetCard } from '@/components/sheet/PremiumSheetCard';
import { PremiumSheetRow } from '@/components/sheet/PremiumSheetRow';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeStore, type ColorScheme } from '@/store/themeStore';
import { useThemeColors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';

export default function AppearanceScreen() {
  const { t } = useTranslation();
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const setColorScheme = useThemeStore((s) => s.setColorScheme);
  const colors = useThemeColors();
  const pickStyles = useMemo(() => createPremiumSheetStyles(colors), [colors]);

  const options: { scheme: ColorScheme; icon: 'sunny-outline' | 'moon-outline'; titleKey: string; hintKey: string }[] =
    useMemo(
      () => [
        { scheme: 'light', icon: 'sunny-outline', titleKey: 'appearance.light', hintKey: 'appearance.lightHint' },
        { scheme: 'dark', icon: 'moon-outline', titleKey: 'appearance.dark', hintKey: 'appearance.darkHint' },
      ],
      [],
    );

  return (
    <PremiumScreen title={t('appearance.title')}>
      <AppText variant="body" color="textSecondary">
        {t('appearance.subtitle')}
      </AppText>

      <PremiumSheetCard>
        {options.map((opt, index) => {
          const selected = colorScheme === opt.scheme;
          return (
            <PremiumSheetRow
              key={opt.scheme}
              divider={index > 0}
              selected={selected}
              title={t(opt.titleKey)}
              subtitle={t(opt.hintKey)}
              icon={<Ionicons name={opt.icon} size={22} color={colors.primaryLight} />}
              onPress={() => setColorScheme(opt.scheme)}
              accessibilityLabel={t(opt.titleKey)}
              showChevron={false}
              trailing={
                selected ? (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                ) : (
                  <View style={pickStyles.radioEmpty} />
                )
              }
            />
          );
        })}
      </PremiumSheetCard>

      <AppText variant="caption" color="textMuted" style={{ marginTop: 8 }}>
        {t('appearance.note')}
      </AppText>
    </PremiumScreen>
  );
}
