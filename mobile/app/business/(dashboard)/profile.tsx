import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  Alert,
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
import { JordanPhoneField } from '@/components/auth/JordanPhoneField';
import {
  BusinessFieldIconSlot,
  businessFieldRowStyle,
  businessHeroTaglineControlStyle,
  businessHeroTitleControlStyle,
  businessMultilineInputStyle,
} from '@/components/business/businessFieldRow';
import { BusinessIconTextField } from '@/components/business/BusinessFormField';
import { BusinessPartnerCategorySelectField } from '@/components/forms/BusinessPartnerCategorySelectField';
import { GovernorateSelectField } from '@/components/forms/GovernorateSelectField';
import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { AppText } from '@/components/ui/AppText';
import { HeroAmbientOverlay } from '@/components/ui/HeroAmbientOverlay';
import { BusinessPartnerGateBanner } from '@/components/business/BusinessPartnerGateBanner';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { listCategories } from '@/api/categoriesApi';
import {
  deleteMyBusinessBanner,
  deleteMyBusinessLogo,
  fetchMyBusinessProfile,
  uploadMyBusinessBanner,
  uploadMyBusinessLogo,
  submitMyBusinessProfileForReview,
  upsertMyBusinessProfile,
} from '@/api/businessProfileApi';
import { listActiveGovernorates } from '@/api/governoratesApi';
import { mapApiError } from '@/utils/mapApiError';
import { hubProfilePatchFromApiDto } from '@/utils/businessHubMappers';
import { resolveGovernorateId } from '@/utils/resolveGovernorateId';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { useLocaleStore } from '@/store/localeStore';
import { createShadows, fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import { textAlignStart } from '@/utils/rtlText';
import type { ThemeColors } from '@/theme/palettes';
import { pickGalleryImage } from '@/utils/pickGalleryImage';
import { jordanLocalDigitsFromStored } from '@/utils/authValidation';
import { normalizePhoneForApi } from '@/utils/profilePatch';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&auto=format&fit=crop';
const DESC_MAX = 800;
const EDIT_ICON = 'pencil' as const;

export default function BusinessProfileScreen() {
  const colors = useThemeColors();
  const sh = useMemo(() => createShadows(colors), [colors]);
  const styles = useMemo(() => createStyles(colors, sh), [colors, sh]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const profile = useBusinessHubStore((s) => s.profile);
  const apiProfileStatus = useBusinessHubStore((s) => s.apiProfileStatus);
  const previouslyApproved = useBusinessHubStore((s) => s.previouslyApproved);
  const updateProfile = useBusinessHubStore((s) => s.updateProfile);
  const syncBusinessApprovalFromApi = useBusinessHubStore((s) => s.syncBusinessApprovalFromApi);

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [tagline, setTagline] = useState(profile.tagline);
  const [description, setDescription] = useState(profile.description);
  const [category, setCategory] = useState(profile.category);
  const [email, setEmail] = useState(profile.email);
  const [phoneLocal, setPhoneLocal] = useState(() => jordanLocalDigitsFromStored(profile.phone));
  const [governorateSlug, setGovernorateSlug] = useState<JordanGovernorateSlug>(profile.governorateSlug);
  const [mapsUrl, setMapsUrl] = useState(profile.mapsUrl);
  const [website, setWebsite] = useState(profile.website);
  const [coverImageUri, setCoverImageUri] = useState(profile.coverImageUri ?? '');
  const [logoUri, setLogoUri] = useState(profile.logoUri ?? '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showRejectedResubmit = apiProfileStatus === 'REJECTED' && previouslyApproved;
  const [descFocused, setDescFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        try {
          const dto = await fetchMyBusinessProfile();
          if (!active || !dto) return;
          syncBusinessApprovalFromApi(dto);
          updateProfile(hubProfilePatchFromApiDto(dto));
        } catch {
          /* no profile yet */
        }
      })();
      return () => {
        active = false;
      };
    }, [syncBusinessApprovalFromApi, updateProfile]),
  );

  useEffect(() => {
    setDisplayName(profile.displayName);
    setTagline(profile.tagline);
    setDescription(profile.description);
    setCategory(profile.category);
    setEmail(profile.email);
    setPhoneLocal(jordanLocalDigitsFromStored(profile.phone));
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

  const onPhoneChange = useCallback((text: string) => {
    setPhoneLocal(text.replace(/\D/g, '').slice(0, 9));
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

  const showCoverActions = useCallback(() => {
    const hasCustomCover = Boolean(coverImageUri.trim());
    Alert.alert(t('businessHub.profileBannerLabel'), undefined, [
      {
        text: t('businessHub.profileChangePhoto'),
        onPress: () => void pickBannerFromHero(),
      },
      ...(hasCustomCover
        ? [
            {
              text: t('businessHub.profileRemovePhoto'),
              style: 'destructive' as const,
              onPress: () => setCoverImageUri(''),
            },
          ]
        : []),
      { text: t('common.cancel'), style: 'cancel' as const },
    ]);
  }, [coverImageUri, pickBannerFromHero, t]);

  const showLogoActions = useCallback(() => {
    const hasLogo = Boolean(logoUri.trim());
    Alert.alert(t('businessHub.profileLogoLabel'), undefined, [
      {
        text: t('businessHub.profileChangePhoto'),
        onPress: () => void pickLogoFromAvatar(),
      },
      ...(hasLogo
        ? [
            {
              text: t('businessHub.profileRemovePhoto'),
              style: 'destructive' as const,
              onPress: () => setLogoUri(''),
            },
          ]
        : []),
      { text: t('common.cancel'), style: 'cancel' as const },
    ]);
  }, [logoUri, pickLogoFromAvatar, t]);

  const coverSrc = coverImageUri.trim() || DEFAULT_COVER;
  const hasCustomCover = Boolean(coverImageUri.trim());
  const hasLogo = Boolean(logoUri.trim());
  const premiumRow = businessFieldRowStyle(colors);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const [categories, governorates] = await Promise.all([listCategories(), listActiveGovernorates()]);
      const primaryCategoryId = categories.find((c) => c.name === category.trim())?.id;
      const governorateId = resolveGovernorateId(governorates, governorateSlug);
      if (primaryCategoryId == null || governorateId == null) {
        Alert.alert(t('common.error'), t('businessJoin.errLists'));
        return;
      }

      let dto = await upsertMyBusinessProfile({
        businessName: displayName.trim().slice(0, 150),
        tagline: tagline.trim() || null,
        primaryCategoryId,
        description: description.trim(),
        workEmail: email.trim(),
        phone: normalizePhoneForApi(phoneLocal),
        governorateId,
        googleMapsUrl: mapsUrl.trim() || null,
        website: website.trim() || null,
      });

      if (logoUri.trim().startsWith('file:')) {
        dto = await uploadMyBusinessLogo(logoUri.trim());
      } else if (!logoUri.trim() && dto.logoImageUrl) {
        dto = await deleteMyBusinessLogo();
      }

      if (coverImageUri.trim().startsWith('file:')) {
        dto = await uploadMyBusinessBanner(coverImageUri.trim());
      } else if (!coverImageUri.trim() && dto.bannerImageUrl) {
        dto = await deleteMyBusinessBanner();
      }

      syncBusinessApprovalFromApi(dto);
      updateProfile(hubProfilePatchFromApiDto(dto));
      if (dto.status === 'PENDING_REVIEW' && dto.requiresReApproval) {
        router.replace('/business/application-pending');
        return;
      }
      if (dto.status === 'REJECTED' && dto.previouslyApproved) {
        setToast(t('businessHub.profileSavedNeedsResubmit'));
      } else {
        setToast(t('businessHub.profileSaved'));
      }
    } catch (e) {
      Alert.alert(t('common.error'), mapApiError(e, t));
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    if (submitting || saving) return;
    setSubmitting(true);
    try {
      const dto = await submitMyBusinessProfileForReview();
      syncBusinessApprovalFromApi(dto);
      updateProfile(hubProfilePatchFromApiDto(dto));
      router.replace('/business/application-pending');
    } catch (e) {
      Alert.alert(t('common.error'), mapApiError(e, t));
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = {
    fieldRowStyle: premiumRow,
    highlightOnFocus: true,
    wrapperStyle: styles.fieldTight,
    technicalInput: true,
  } as const;

  const fieldIcon = (name: keyof typeof Ionicons.glyphMap) => (
    <BusinessFieldIconSlot>
      <Ionicons name={name} size={20} color={colors.primary} />
    </BusinessFieldIconSlot>
  );

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
              onLongPress={showCoverActions}
              delayLongPress={320}
              accessibilityRole="button"
              accessibilityLabel={t('businessHub.profileTapHeroBanner')}
              accessibilityHint={t('businessHub.profilePhotoActionsHint')}
            >
              <Image source={{ uri: coverSrc }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'transparent', colors.overlayLight, fadeFromBackground(colors, 1)]}
                locations={[0, 0.35, 0.72, 1]}
                style={StyleSheet.absoluteFill}
              />
              <HeroAmbientOverlay />
              <View style={[styles.editBadge, styles.editBadgeCover]}>
                <Ionicons name={EDIT_ICON} size={18} color={colors.text} />
              </View>
            </Pressable>
          </View>

          <View style={[styles.avatarRing, { borderColor: colors.cream }]}>
            <Pressable
              onPress={() => void pickLogoFromAvatar()}
              onLongPress={showLogoActions}
              delayLongPress={320}
              accessibilityRole="button"
              accessibilityLabel={t('businessHub.profileTapAvatarLogo')}
              accessibilityHint={t('businessHub.profilePhotoActionsHint')}
              style={styles.avatarPressable}
            >
              {hasLogo ? (
                <Image source={{ uri: logoUri.trim() }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <View style={[styles.avatarImg, styles.avatarFallback]}>
                  <Ionicons name="business" size={38} color={colors.placeholder} />
                </View>
              )}
              <View style={[styles.editBadge, styles.editBadgeLogo]}>
                <Ionicons name={EDIT_ICON} size={18} color={colors.text} />
              </View>
            </Pressable>
          </View>

          <View style={styles.heroTextBlock}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('businessHub.profileNamePlaceholder')}
              placeholderTextColor={colors.placeholder}
              style={[
                businessHeroTitleControlStyle(locale),
                {
                  color: colors.text,
                  writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
                },
              ]}
            />
            <TextInput
              value={tagline}
              onChangeText={setTagline}
              placeholder={t('businessHub.profileTaglinePlaceholder')}
              placeholderTextColor={colors.placeholder}
              style={[
                businessHeroTaglineControlStyle(locale),
                {
                  color: colors.textSecondary,
                  writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
                },
              ]}
            />
            <AppText variant="caption" color="textMuted" style={styles.heroLead}>
              {t('businessHub.profileLead')}
            </AppText>
          </View>
        </View>

        <View style={styles.sectionStack}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="overline" color="primaryLight">
                {t('businessHub.profileSectionPublic')}
              </AppText>
            </View>

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
                <AppText variant="label" color="textMuted" style={styles.descLabelCount}>
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
                  placeholderTextColor={colors.placeholder}
                  multiline
                  textAlignVertical="top"
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                  style={[
                    businessMultilineInputStyle(locale),
                    {
                      color: colors.text,
                      textAlign: textAlignStart(isRTL),
                      writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="overline" color="primaryLight">
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
              leftSlot={fieldIcon('mail-outline')}
              {...fieldProps}
            />
            <JordanPhoneField
              label={t('businessJoin.phone')}
              value={phoneLocal}
              onChangeText={onPhoneChange}
              placeholder={t('auth.phonePlaceholder')}
              appearance="business"
              fieldRowStyle={premiumRow}
              highlightOnFocus
              wrapperStyle={styles.fieldTight}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="overline" color="primaryLight">
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
              {...fieldProps}
            />
            <AuthTextField
              label={t('businessHub.profileWebsite')}
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              autoCorrect={false}
              leftSlot={fieldIcon('globe-outline')}
              {...fieldProps}
            />
          </View>
        </View>

        <BusinessPartnerGateBanner />

        <View style={styles.saveSection}>
          <PrimaryButton
            title={t('businessHub.profileSaveCta')}
            onPress={() => void save()}
            loading={saving}
            style={styles.saveFull}
          />
          {showRejectedResubmit ? (
            <SecondaryButton
              title={
                submitting
                  ? t('businessHub.profileSubmittingForReview')
                  : t('businessHub.profileSubmitForReview')
              }
              onPress={() => void submitForReview()}
              disabled={saving || submitting}
              style={styles.saveFull}
            />
          ) : null}
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
      gap: spacing.md,
    },
    heroWrap: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    heroImageBox: {
      width: '100%',
      overflow: 'hidden',
    },
    editBadge: {
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
    editBadgeCover: {
      position: 'absolute',
      bottom: spacing.md,
      left: spacing.md,
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    editBadgeLogo: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      zIndex: 2,
    },
    avatarRing: {
      marginTop: -52,
      borderRadius: 52,
      borderWidth: 4,
      padding: 3,
      backgroundColor: 'transparent',
      overflow: 'visible',
      ...sh.md,
    },
    avatarPressable: {
      position: 'relative',
      overflow: 'visible',
    },
    avatarImg: {
      width: 92,
      height: 92,
      borderRadius: 46,
    },
    avatarFallback: {
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTextBlock: {
      width: '100%',
      paddingHorizontal: spacing.screen,
      marginTop: spacing.md,
      gap: spacing.xs,
      alignItems: 'center',
    },
    heroLead: {
      marginTop: spacing.sm,
      lineHeight: 18,
      paddingHorizontal: spacing.md,
      textAlign: 'center',
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
      marginBottom: spacing.lg,
      gap: 4,
    },
    fieldTight: { marginBottom: 0 },
    descBoxWrap: { gap: spacing.xs, marginTop: spacing.xs },
    descLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    descLabelCount: {
      writingDirection: 'ltr',
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
