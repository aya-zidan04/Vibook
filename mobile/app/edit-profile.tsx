import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useMockUser } from '@/hooks/useMockUser';
import { useTranslation } from '@/i18n/useTranslation';
import {
  isValidEmail,
  isValidJordanLocalPhone,
  jordanLocalDigitsFromStored,
} from '@/utils/authValidation';
import { nameToFirstLast, normalizePhoneForApi } from '@/utils/profilePatch';
import { pickGalleryImage } from '@/utils/pickGalleryImage';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function EditProfileScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const { user, setOverrides } = useMockUser();

  const initialParts = useMemo(() => nameToFirstLast(user.name), [user.name]);

  const [firstName, setFirstName] = useState(initialParts.firstName);
  const [lastName, setLastName] = useState(initialParts.lastName ?? '');
  const [email, setEmail] = useState(user.email);
  const [phoneLocal, setPhoneLocal] = useState(() => jordanLocalDigitsFromStored(user.phone));

  useEffect(() => {
    const p = nameToFirstLast(user.name);
    setFirstName(p.firstName);
    setLastName(p.lastName ?? '');
    setEmail(user.email);
    setPhoneLocal(jordanLocalDigitsFromStored(user.phone));
  }, [user]);

  const onPhoneChange = (text: string) => {
    const d = text.replace(/\D/g, '').slice(0, 9);
    setPhoneLocal(d);
  };

  const photoPermission = useMemo(
    () => ({
      title: t('editProfile.photoPermissionTitle'),
      body: t('editProfile.photoPermissionBody'),
    }),
    [t],
  );

  const onChangePhotoPress = useCallback(async () => {
    const uri = await pickGalleryImage({
      aspect: [1, 1],
      permissionTitle: photoPermission.title,
      permissionBody: photoPermission.body,
    });
    if (uri) {
      setOverrides({ avatarUrl: uri });
    }
  }, [photoPermission.body, photoPermission.title, setOverrides]);

  const onRemovePhotoPress = useCallback(() => {
    Alert.alert(t('editProfile.removePhotoTitle'), t('editProfile.removePhotoBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('editProfile.removePhoto'),
        style: 'destructive',
        onPress: () => setOverrides({ avatarUrl: null }),
      },
    ]);
  }, [setOverrides, t]);

  const save = () => {
    if (!firstName.trim()) {
      Alert.alert(t('common.error'), t('editProfile.errFirstName'));
      return;
    }
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert(t('common.error'), t('editProfile.errEmail'));
      return;
    }
    if (!isValidJordanLocalPhone(phoneLocal)) {
      Alert.alert(t('common.error'), t('editProfile.errPhoneJordan'));
      return;
    }
    setOverrides({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: trimmedEmail,
      phone: normalizePhoneForApi(phoneLocal),
    });
    Alert.alert(t('editProfile.saved'));
    router.back();
  };

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      edges={['top', 'left', 'right', 'bottom']}
      header={<DetailHeader title={t('editProfile.title')} />}
    >
      <View style={styles.hero}>
        <View style={styles.avatarColumn}>
          <View style={styles.avatarWrap}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={44} color={colors.textMuted} />
              </View>
            )}
            <Pressable
              style={({ pressed }) => [styles.avatarEditBadge, pressed && styles.avatarEditPressed]}
              onPress={() => void onChangePhotoPress()}
              accessibilityRole="button"
              accessibilityLabel={t('editProfile.changePhotoA11y')}
              hitSlop={8}
            >
              <Ionicons name="pencil" size={18} color={colors.accent} />
            </Pressable>
          </View>
          <AppText variant="meta" color="textMuted" style={styles.heroNote}>
            {t('editProfile.note')}
          </AppText>
          {user.avatarUrl ? (
            <Pressable onPress={onRemovePhotoPress} hitSlop={8} accessibilityRole="button">
              <AppText variant="caption" color="accent" style={styles.removePhoto}>
                {t('editProfile.removePhoto')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.nameRow}>
        <View style={styles.nameHalf}>
          <AuthTextField
            label={t('editProfile.firstName')}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.nameHalf}>
          <AuthTextField
            label={t('editProfile.lastName')}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>
      </View>

      <AuthTextField
        label={t('editProfile.phone')}
        value={phoneLocal}
        onChangeText={onPhoneChange}
        placeholder={t('auth.phonePlaceholder')}
        helper={t('editProfile.phoneJordanNote')}
        keyboardType="number-pad"
        autoCorrect={false}
        textInputStyle={styles.phoneInput}
        leftSlot={
          <View style={styles.phonePrefix}>
            <AppText variant="bodyMedium" style={styles.flag}>
              🇯🇴
            </AppText>
            <AppText variant="bodyMedium" color="textSecondary">
              +962
            </AppText>
            <View style={styles.phoneSep} />
          </View>
        }
      />

      <AuthTextField
        label={t('editProfile.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.emailPlaceholder')}
        helper={t('editProfile.emailHelper')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <PrimaryButton title={t('common.save')} onPress={save} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    hero: {
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    avatarColumn: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    avatarWrap: {
      position: 'relative',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 3,
      borderColor: colors.primaryMuted,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    removePhoto: {
      textDecorationLine: 'underline',
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 2,
      end: 2,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
        },
        android: { elevation: 4 },
        default: {},
      }),
    },
    avatarEditPressed: { opacity: 0.85 },
    heroNote: {
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
      lineHeight: 18,
    },
    nameRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: 0,
    },
    nameHalf: { flex: 1 },
    phonePrefix: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingStart: spacing.sm,
    },
    flag: { fontSize: 20 },
    phoneSep: {
      width: 1,
      height: 26,
      backgroundColor: colors.border,
    },
    phoneInput: {
      textAlign: 'left',
      writingDirection: 'ltr',
    },
  });
}
