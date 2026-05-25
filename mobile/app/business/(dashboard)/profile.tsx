import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { ProfileImageField } from '@/components/business/ProfileImageField';
import { BusinessIconTextField } from '@/components/business/BusinessFormField';
import { BusinessPartnerCategorySelectField } from '@/components/forms/BusinessPartnerCategorySelectField';
import { GovernorateSelectField } from '@/components/forms/GovernorateSelectField';
import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { useLocaleStore } from '@/store/localeStore';
import { createShadows, fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import { inputTextStyle } from '@/theme/typography';
import { textAlignStart } from '@/utils/rtlText';
import type { ThemeColors } from '@/theme/palettes';
import { pickGalleryImage } from '@/utils/pickGalleryImage';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&auto=format&fit=crop';
const DESC_MAX = 800;

const inputRowPremium = (colors: ThemeColors): object => ({
  minHeight: 54,
  borderRadius: radii.xl,
  backgroundColor: colors.surfaceMuted,
  borderColor: colors.borderLight,
});

export default function BusinessProfileScreen() {
  const colors = useThemeColors();
  const sh = useMemo(() => createShadows(colors), [colors]);
  const styles = useMemo(() => createStyles(colors, sh), [colors, sh]);
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const profile = useBusinessHubStore((s) => s.profile);
  const updateProfile = useBusinessHubStore((s) => s.updateProfile);

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [tagline, setTagline] = useState(profile.tagline);
  const [description, setDescription] = useState(profile.description);
  const [category, setCategory] = useState(profile.category);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [governorateSlug, setGovernorateSlug] = useState<JordanGovernorateSlug>(profile.governorateSlug);
  const [mapsUrl, setMapsUrl] = useState(profile.mapsUrl);
  const [website, setWebsite] = useState(profile.website);
  const [coverImageUri, setCoverImageUri] = useState(profile.coverImageUri ?? '');
  const [logoUri, setLogoUri] = useState(profile.logoUri ?? '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [descFocused, setDescFocused] = useState(false);

  useEffect(() => {
    setDisplayName(profile.displayName);
    setTagline(profile.tagline);
    setDescription(profile.description);
    setCategory(profile.category);
    setEmail(profile.email);
    setPhone(profile.phone);
    setGovernorateSlug(profile.governorateSlug);
    setMapsUrl(profile.mapsUrl);
    setWebsite(profile.website);
    setCoverImageUri(profile.coverImageUri ?? '');
    setLogoUri(profile.logoUri ?? '');
  }, [profile]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const onDescChange = useCallback((text: string) => {
    setDescription(text.length > DESC_MAX ? text.slice(0, DESC_MAX) : text);
  }, []);

  const permissionPick = useMemo(
    () => ({
      title: t('businessHub.profilePhotoPermissionTitle'),
      body: t('businessHub.profilePhotoPermissionBody'),
    }),
    [t],
  );

  const pickBannerFromHero = useCallback(async () => {
    const uri = await pickGalleryImage({
      aspect: [16, 9],
      permissionTitle: permissionPick.title,
      permissionBody: permissionPick.body,
    });
    if (uri) setCoverImageUri(uri);
  }, [permissionPick.body, permissionPick.title]);

  const pickLogoFromAvatar = useCallback(async () => {
    const uri = await pickGalleryImage({
      aspect: [1, 1],
      permissionTitle: permissionPick.title,
      permissionBody: permissionPick.body,
    });
    if (uri) setLogoUri(uri);
  }, [permissionPick.body, permissionPick.title]);

  const coverSrc = coverImageUri.trim() || DEFAULT_COVER;
  const premiumRow = inputRowPremium(colors);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 480));
    updateProfile({
      displayName: displayName.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      category: category.trim(),
      email: email.trim(),
      phone: phone.trim(),
      governorateSlug,
      mapsUrl: mapsUrl.trim(),
      website: website.trim(),
      coverImageUri: coverImageUri.trim(),
      logoUri: logoUri.trim(),
    });
    setSaving(false);
    setToast(t('businessHub.profileSaved'));
  };

  const fieldProps = {
    fieldRowStyle: premiumRow,
    highlightOnFocus: true,
    wrapperStyle: styles.fieldTight,
  } as const;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxxl + Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <View style={[styles.heroWrap, { marginTop: -insets.top }]}>
          <View style={[styles.heroImageBox, { paddingTop: insets.top, height: 200 + insets.top }]}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => void pickBannerFromHero()}
              accessibilityRole="button"
              accessibilityLabel={t('businessHub.profileTapHeroBanner')}
            >
              <Image source={{ uri: coverSrc }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'transparent', colors.overlayLight, fadeFromBackground(colors, 1)]}
                locations={[0, 0.35, 0.72, 1]}
                style={StyleSheet.absoluteFill}
              />
            </Pressable>
          </View>

          <View style={[styles.avatarRing, { borderColor: colors.cream }]}>
            <Pressable
              onPress={() => void pickLogoFromAvatar()}
              accessibilityRole="button"
              accessibilityLabel={t('businessHub.profileTapAvatarLogo')}
            >
              {logoUri.trim() ? (
                <Image source={{ uri: logoUri.trim() }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <View style={[styles.avatarImg, styles.avatarFallback]}>
                  <Ionicons name="business" size={38} color={colors.primary} />
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.heroTextBlock}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('businessHub.profileNamePlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.heroName,
                inputTextStyle(locale, 'h1'),
                { color: colors.text, textAlign: isRTL ? 'right' : 'center' },
              ]}
            />
            <TextInput
              value={tagline}
              onChangeText={setTagline}
              placeholder={t('businessHub.profileTaglinePlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.heroTagline,
                inputTextStyle(locale),
                { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'center' },
              ]}
            />
            <AppText
              variant="caption"
              color="textMuted"
              style={[styles.heroLead, { textAlign: isRTL ? 'right' : 'center' }]}
            >
              {t('businessHub.profileLead')}
            </AppText>
          </View>
        </View>

        <View style={styles.sectionStack}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="overline" color="accent">
                {t('businessHub.profileSectionPublic')}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {t('businessHub.profileSectionPublicSub')}
              </AppText>
            </View>

            <ProfileImageField
              label={t('businessHub.profileBannerLabel')}
              uri={coverImageUri}
              onUriChange={setCoverImageUri}
              pickLabel={t('businessHub.profilePickPhoto')}
              changeLabel={t('businessHub.profileChangePhoto')}
              removeLabel={t('businessHub.profileRemovePhoto')}
              permissionTitle={permissionPick.title}
              permissionBody={permissionPick.body}
              variant="banner"
              aspect={[16, 9]}
            />
            <ProfileImageField
              label={t('businessHub.profileLogoLabel')}
              uri={logoUri}
              onUriChange={setLogoUri}
              pickLabel={t('businessHub.profilePickPhoto')}
              changeLabel={t('businessHub.profileChangePhoto')}
              removeLabel={t('businessHub.profileRemovePhoto')}
              permissionTitle={permissionPick.title}
              permissionBody={permissionPick.body}
              variant="logo"
              aspect={[1, 1]}
            />
            <BusinessPartnerCategorySelectField
              label={t('businessHub.profileCategory')}
              valueEn={category}
              onChangeEn={setCategory}
              sheetTitle={t('businessHub.profileCategorySheet')}
            />

            <View style={styles.descBoxWrap}>
              <View style={styles.descLabelRow}>
                <AppText variant="label" color="text">
                  {t('businessHub.profileDescription')}
                </AppText>
                <AppText variant="label" color="textMuted">
                  {t('businessHub.profileCharCount')
                    .replace('{n}', String(description.length))
                    .replace('{max}', String(DESC_MAX))}
                </AppText>
              </View>
              <View
                style={[
                  styles.descBox,
                  descFocused && { borderColor: colors.primary, borderWidth: 1.5 },
                ]}
              >
                <TextInput
                  value={description}
                  onChangeText={onDescChange}
                  placeholder={t('businessHub.profileDescriptionPh')}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                  style={[
                    styles.descInput,
                    inputTextStyle(locale),
                    {
                      color: colors.text,
                      textAlign: textAlignStart(isRTL),
                      writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
                    },
                  ]}
                />
              </View>
              <AppText variant="label" color="textMuted" style={styles.previewHint}>
                {t('businessHub.profilePreviewHint')}
              </AppText>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="overline" color="accent">
                {t('businessHub.profileSectionContact')}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {t('businessHub.profileSectionContactSub')}
              </AppText>
            </View>
            <AuthTextField
              label={t('businessJoin.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftSlot={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
              {...fieldProps}
            />
            <AuthTextField
              label={t('businessJoin.phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              leftSlot={<Ionicons name="call-outline" size={20} color={colors.textMuted} />}
              {...fieldProps}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="overline" color="accent">
                {t('businessHub.profileSectionLocation')}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {t('businessHub.profileSectionLocationSub')}
              </AppText>
            </View>
            <GovernorateSelectField
              appearance="business"
              label={t('businessHub.fieldGovernorate')}
              valueSlug={governorateSlug}
              onChangeSlug={setGovernorateSlug}
              sheetTitle={t('businessHub.fieldGovernorateSheet')}
            />
            <BusinessIconTextField
              icon="link-outline"
              label={t('businessHub.fieldMapsUrl')}
              value={mapsUrl}
              onChangeText={setMapsUrl}
              placeholder={t('businessHub.fieldMapsUrlPh')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AuthTextField
              label={t('businessHub.profileWebsite')}
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              autoCorrect={false}
              leftSlot={<Ionicons name="link-outline" size={20} color={colors.textMuted} />}
              {...fieldProps}
            />
          </View>
        </View>

        <View style={styles.saveSection}>
          <PrimaryButton
            title={t('businessHub.profileSaveCta')}
            onPress={() => void save()}
            loading={saving}
            style={styles.saveFull}
          />
        </View>

        {toast ? (
          <View style={[styles.toastInline, sh.sm, { borderColor: colors.borderLight }]}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <AppText variant="body-em" color="text" style={styles.toastText}>
              {toast}
            </AppText>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ThemeColors, sh: ReturnType<typeof createShadows>) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    saveSection: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.screen,
    },
    heroWrap: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    heroImageBox: {
      width: '100%',
      overflow: 'hidden',
    },
    avatarRing: {
      marginTop: -52,
      borderRadius: 52,
      borderWidth: 4,
      padding: 3,
      backgroundColor: 'transparent',
      ...sh.md,
    },
    avatarImg: {
      width: 92,
      height: 92,
      borderRadius: 46,
    },
    avatarFallback: {
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTextBlock: {
      width: '100%',
      paddingHorizontal: spacing.screen,
      marginTop: spacing.md,
      gap: spacing.xs,
    },
    heroName: {
      paddingVertical: 4,
    },
    heroTagline: {
      paddingVertical: 2,
    },
    heroLead: {
      marginTop: spacing.sm,
      lineHeight: 18,
      paddingHorizontal: spacing.md,
    },
    sectionStack: {
      paddingHorizontal: spacing.screen,
      gap: spacing.lg,
    },
    card: {
      borderRadius: radii.xxl,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      ...sh.sm,
    },
    cardHead: {
      marginBottom: spacing.md,
      gap: 4,
    },
    fieldTight: { marginBottom: spacing.sm },
    descBoxWrap: { gap: spacing.xs, marginTop: spacing.xs },
    descLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    descBox: {
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 148,
    },
    descInput: {
      minHeight: 120,
    },
    previewHint: { marginTop: 4, lineHeight: 18 },
    saveFull: { width: '100%' },
    toastInline: {
      marginTop: spacing.md,
      marginHorizontal: spacing.screen,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
    },
    toastText: { flex: 1 },
  });
}
