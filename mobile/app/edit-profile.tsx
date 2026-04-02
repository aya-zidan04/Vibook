import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useMockUser } from '@/hooks/useMockUser';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function EditProfileScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user, setOverrides } = useMockUser();

  const displayName = locale === 'ar' && user.nameAr ? user.nameAr : user.name;

  const [name, setName] = useState(user.name);
  const [nameAr, setNameAr] = useState(user.nameAr ?? '');
  const [phone, setPhone] = useState(user.phone);

  useEffect(() => {
    setName(user.name);
    setNameAr(user.nameAr ?? '');
    setPhone(user.phone);
  }, [user]);

  const save = () => {
    setOverrides({
      name,
      nameAr: nameAr.trim() || undefined,
      phone,
    });
    Alert.alert(t('editProfile.saved'));
    router.back();
  };

  return (
    <Screen scroll contentStyle={styles.pad} edges={['top', 'left', 'right', 'bottom']}>
      <DetailHeader title={t('editProfile.title')} />
      <View style={styles.hero}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" />
        <View style={styles.heroText}>
          <AppText variant="h3" color="text">
            {displayName}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {user.email}
          </AppText>
          <AppText variant="meta" color="textMuted" style={styles.emailNote}>
            {t('editProfile.emailNote')}
          </AppText>
        </View>
      </View>

      <AuthTextField
        label={t('editProfile.name')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <AuthTextField
        label={t('editProfile.nameAr')}
        value={nameAr}
        onChangeText={setNameAr}
        autoCapitalize="words"
      />
      <AuthTextField
        label={t('editProfile.phone')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <AppText variant="caption" color="textMuted" style={styles.note}>
        {t('editProfile.note')}
      </AppText>

      <PrimaryButton title={t('common.save')} onPress={save} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, paddingBottom: spacing.xxxl, gap: 0 },
    hero: {
      flexDirection: 'row',
      gap: spacing.lg,
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 2,
      borderColor: colors.border,
    },
    heroText: { flex: 1, gap: 4 },
    emailNote: { marginTop: 4, lineHeight: 18 },
    note: { lineHeight: 20, marginTop: spacing.sm, marginBottom: spacing.lg },
  });
}
