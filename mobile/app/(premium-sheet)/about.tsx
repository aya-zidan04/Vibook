import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing } from '@/theme';

export default function AboutScreen() {
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
      </View>
    </PremiumScreen>
  );
}
