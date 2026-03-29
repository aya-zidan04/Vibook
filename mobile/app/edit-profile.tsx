import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { CURRENT_USER } from '@/mock';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function EditProfileScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const displayName = locale === 'ar' && CURRENT_USER.nameAr ? CURRENT_USER.nameAr : CURRENT_USER.name;

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('editProfile.title')} />
      <View style={styles.row}>
        <Image source={{ uri: CURRENT_USER.avatarUrl }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <AppText variant="h3" color="text">
            {displayName}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {CURRENT_USER.email}
          </AppText>
        </View>
      </View>
      <AppText variant="body" color="textSecondary">
        {t('editProfile.note')}
      </AppText>
      <PrimaryButton title={t('common.save')} onPress={() => {}} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.border,
  },
});

}
