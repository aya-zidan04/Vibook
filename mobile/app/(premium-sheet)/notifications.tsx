import { useMemo } from 'react';
import { Platform, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { PremiumSheetCard } from '@/components/sheet/PremiumSheetCard';
import { PremiumSheetRow } from '@/components/sheet/PremiumSheetRow';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';
import { radii, useThemeColors } from '@/theme';

const MOCK_KEYS: { titleKey: string; bodyKey: string; timeKey: string; icon: 'calendar-outline' | 'pricetag-outline' }[] = [
  { titleKey: 'notifications.n1Title', bodyKey: 'notifications.n1Body', timeKey: 'notifications.time1', icon: 'calendar-outline' },
  { titleKey: 'notifications.n2Title', bodyKey: 'notifications.n2Body', timeKey: 'notifications.time2', icon: 'pricetag-outline' },
];

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const { t } = useTranslation();
  const pushEnabled = useAppStore((s) => s.pushNotificationsEnabled);
  const setPushEnabled = useAppStore((s) => s.setPushNotificationsEnabled);

  const switchWrap = [
    { borderRadius: radii.full, padding: 2 },
    isLight && {
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    isLight && pushEnabled && {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentLight,
    },
  ];

  return (
    <PremiumScreen title={t('notifications.title')}>
      <PremiumSheetCard accent={pushEnabled}>
        <PremiumSheetRow
          accentSelected={pushEnabled}
          iconAccent={pushEnabled}
          icon={<Ionicons name="notifications-outline" size={22} color={pushEnabled ? colors.accent : colors.primary} />}
          title={t('settings.push')}
          showChevron={false}
          trailing={
            <View style={switchWrap}>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: colors.border, true: colors.accentMuted }}
                thumbColor={
                  pushEnabled
                    ? colors.accent
                    : Platform.OS === 'android'
                      ? colors.surfaceMuted
                      : undefined
                }
                ios_backgroundColor={colors.border}
                accessibilityLabel={t('settings.push')}
              />
            </View>
          }
        />
      </PremiumSheetCard>

      <AppText variant="caption" color="textMuted">
        {t('notifications.recent')}
      </AppText>

      <PremiumSheetCard>
        {MOCK_KEYS.map((n, i) => (
          <PremiumSheetRow
            key={n.titleKey}
            divider={i > 0}
            icon={<Ionicons name={n.icon} size={22} color={colors.primary} />}
            title={t(n.titleKey)}
            subtitle={`${t(n.bodyKey)}\n${t(n.timeKey)}`}
            showChevron={false}
          />
        ))}
      </PremiumSheetCard>

      <AppText variant="caption" color="textMuted" style={{ marginTop: 8 }}>
        {t('settings.note')}
      </AppText>
    </PremiumScreen>
  );
}
