import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { SUPPORT_EMAIL, openSupportEmail } from '@/utils/supportEmail';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function AboutScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();

  return (
    <Screen scroll contentStyle={styles.pad} header={<DetailHeader title={t('about.title')} />}>
      <AppText variant="h3" color="text">
        {t('about.tagline')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.para}>
        {t('about.body1')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.para}>
        {t('about.body2')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.para}>
        {t('about.body3')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.para}>
        {t('about.body4')}
      </AppText>

      <View style={styles.section}>
        <AppText variant="bodyMedium" color="text" style={styles.sectionTitle}>
          {t('about.valuesTitle')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.para}>
          {t('about.value1')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.para}>
          {t('about.value2')}
        </AppText>
      </View>

      <Pressable
        style={({ pressed }) => [styles.contact, pressed && styles.contactPressed]}
        onPress={() => void openSupportEmail('Vibook — About')}
        accessibilityRole="link"
        accessibilityLabel={t('about.emailUs')}
        accessibilityHint={t('about.emailHint')}
      >
        <Ionicons name="mail-outline" size={22} color={colors.accent} />
        <View style={styles.contactText}>
          <AppText variant="bodyMedium" color="accent">
            {t('about.emailUs')}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {SUPPORT_EMAIL}
          </AppText>
        </View>
      </Pressable>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    para: { lineHeight: 22 },
    section: { marginTop: spacing.md, gap: spacing.sm },
    sectionTitle: { marginBottom: spacing.xs },
    contact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      marginTop: spacing.lg,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    contactText: { flex: 1, gap: 4 },
    contactPressed: { opacity: 0.88 },
  });
}
