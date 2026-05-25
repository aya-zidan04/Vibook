import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useTranslation } from '@/i18n/useTranslation';
import { SUPPORT_EMAIL, openSupportEmail } from '@/utils/supportEmail';
import { chevronForwardTrailing } from '@/utils/rtl';
import { spacing, useThemeColors } from '@/theme';

export default function AboutScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const { t } = useTranslation();

  return (
    <PremiumScreen title={t('about.title')}>
      <AppText variant="h3" color="text">
        {t('about.tagline')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={{ lineHeight: 22 }}>
        {t('about.body1')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={{ lineHeight: 22 }}>
        {t('about.body2')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={{ lineHeight: 22 }}>
        {t('about.body3')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={{ lineHeight: 22 }}>
        {t('about.body4')}
      </AppText>

      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        <AppText variant="body-em" color="text">
          {t('about.valuesTitle')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={{ lineHeight: 22 }}>
          {t('about.value1')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={{ lineHeight: 22 }}>
          {t('about.value2')}
        </AppText>
      </View>

      <Pressable
        style={({ pressed }) => [styles.contactRow, pressed && { opacity: 0.88 }]}
        onPress={() => void openSupportEmail('Vibook — About')}
        accessibilityRole="link"
        accessibilityLabel={t('about.emailUs')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={22} color={colors.accent} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="body-em" color="accent">
            {t('about.emailUs')}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {SUPPORT_EMAIL}
          </AppText>
        </View>
        <Ionicons name={chevronForwardTrailing()} size={20} color={colors.textMuted} />
      </Pressable>
    </PremiumScreen>
  );
}
