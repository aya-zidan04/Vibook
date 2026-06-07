import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { JordanPhoneField } from '@/components/auth/JordanPhoneField';
import { BusinessFieldIconSlot, businessFieldRowStyle } from '@/components/business/businessFieldRow';
import { BusinessPartnerCategorySelectField } from '@/components/forms/BusinessPartnerCategorySelectField';
import { GovernorateSelectField } from '@/components/forms/GovernorateSelectField';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { listCategories } from '@/api/categoriesApi';
import {
  submitMyBusinessProfileForReview,
  upsertMyBusinessProfile,
} from '@/api/businessProfileApi';
import { listActiveGovernorates } from '@/api/governoratesApi';
import { mapApiError } from '@/utils/mapApiError';
import type { CategoryResponse, GovernorateResponse } from '@/api/types';
import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { useLocaleStore } from '@/store/localeStore';
import { inputTextStyle } from '@/theme/typography';
import { textAlignStart } from '@/utils/rtlText';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { isValidEmail, isValidJordanLocalPhone } from '@/utils/authValidation';
import { normalizePhoneForApi } from '@/utils/profilePatch';
import { resolveGovernorateId } from '@/utils/resolveGovernorateId';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const MAX = {
  company: 150,
  email: 255,
  phone: 32,
  message: 800,
} as const;

type FieldKey = 'companyName' | 'email' | 'phone' | 'category' | 'message';

export default function BusinessJoinScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const premiumRow = useMemo(() => businessFieldRowStyle(colors), [colors]);
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const submitApplication = useBusinessHubStore((s) => s.submitApplication);
  const syncBusinessApprovalFromApi = useBusinessHubStore((s) => s.syncBusinessApprovalFromApi);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [governorates, setGovernorates] = useState<GovernorateResponse[]>([]);
  const [listsReady, setListsReady] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [governorateSlug, setGovernorateSlug] = useState<JordanGovernorateSlug>('amman');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [cats, govs] = await Promise.all([listCategories(), listActiveGovernorates()]);
        if (!cancelled) {
          setCategories(cats);
          setGovernorates(govs);
        }
      } catch {
        /* submit will surface errors */
      } finally {
        if (!cancelled) setListsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const clearError = (k: FieldKey) => {
    setErrors((e) => {
      const next = { ...e };
      delete next[k];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!companyName.trim()) next.companyName = t('businessJoin.errRequired');
    else if (companyName.trim().length > MAX.company) next.companyName = t('businessJoin.errTooLong');

    if (!email.trim()) next.email = t('businessJoin.errRequired');
    else if (!isValidEmail(email)) next.email = t('businessJoin.errEmail');
    else if (email.trim().length > MAX.email) next.email = t('businessJoin.errTooLong');

    const phoneDigits = phone.replace(/\D/g, '').slice(-9);
    if (!isValidJordanLocalPhone(phoneDigits)) {
      next.phone = phoneDigits.length > 0 ? t('businessJoin.errPhone') : t('businessJoin.errRequired');
    }

    if (!category.trim()) next.category = t('businessJoin.errRequired');

    if (message.trim().length > MAX.message) next.message = t('businessJoin.errTooLong');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setSubmitError(null);
    if (!validate() || busy) return;

    const primaryCategoryId = categories.find((c) => c.name === category)?.id;
    const governorateId = resolveGovernorateId(governorates, governorateSlug);
    if (primaryCategoryId == null || !listsReady) {
      setSubmitError(t('businessJoin.errLists'));
      return;
    }
    if (governorateId == null) {
      setSubmitError(t('businessJoin.errLists'));
      return;
    }

    const description = (message.trim() || t('businessJoin.messageDefault')).slice(0, MAX.message);

    const phoneDigits = phone.replace(/\D/g, '').slice(-9);
    const phoneE164 = normalizePhoneForApi(phoneDigits);

    const localBody = {
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phoneE164,
      category: category.trim(),
      message: description,
    };

    setBusy(true);
    try {
      await upsertMyBusinessProfile({
        businessName: companyName.trim().slice(0, MAX.company),
        tagline: null,
        primaryCategoryId,
        description,
        workEmail: email.trim(),
        phone: phoneE164,
        governorateId,
        googleMapsUrl: null,
        website: null,
      });
      const submitted = await submitMyBusinessProfileForReview();
      submitApplication(localBody);
      syncBusinessApprovalFromApi(submitted);
      router.replace('/business/application-pending');
    } catch (e) {
      setSubmitError(mapApiError(e, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      edges={['top', 'left', 'right', 'bottom']}
      header={<DetailHeader title={t('businessJoin.title')} />}
    >
      <AppText variant="body" color="textSecondary">
        {t('businessJoin.subtitle')}
      </AppText>

      <AuthTextField
        label={t('businessJoin.company')}
        placeholder={t('businessJoin.companyPh')}
        value={companyName}
        onChangeText={(v) => {
          setCompanyName(v);
          clearError('companyName');
        }}
        autoCapitalize="words"
      />
      {errors.companyName ? (
        <AppText variant="label" color="error" style={styles.inlineErr}>
          {errors.companyName}
        </AppText>
      ) : null}

      <AuthTextField
        label={t('businessJoin.email')}
        placeholder={t('businessJoin.emailPh')}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          clearError('email');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        technicalInput
        leftSlot={
          <BusinessFieldIconSlot>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </BusinessFieldIconSlot>
        }
      />
      {errors.email ? (
        <AppText variant="label" color="error" style={styles.inlineErr}>
          {errors.email}
        </AppText>
      ) : null}

      <JordanPhoneField
        label={t('businessJoin.phone')}
        placeholder={t('businessJoin.phonePh')}
        value={phone}
        onChangeText={(v) => {
          setPhone(v.replace(/\D/g, '').slice(0, 9));
          clearError('phone');
        }}
        appearance="business"
        fieldRowStyle={premiumRow}
        highlightOnFocus
      />
      {errors.phone ? (
        <AppText variant="label" color="error" style={styles.inlineErr}>
          {errors.phone}
        </AppText>
      ) : null}

      <GovernorateSelectField
        appearance="business"
        label={t('businessJoin.governorate')}
        valueSlug={governorateSlug}
        onChangeSlug={setGovernorateSlug}
        sheetTitle={t('businessHub.fieldGovernorateSheet')}
      />

      <BusinessPartnerCategorySelectField
        label={t('businessJoin.category')}
        valueEn={category}
        onChangeEn={(en) => {
          setCategory(en);
          clearError('category');
        }}
        sheetTitle={t('businessHub.profileCategorySheet')}
      />
      {errors.category ? (
        <AppText variant="label" color="error" style={styles.inlineErr}>
          {errors.category}
        </AppText>
      ) : null}

      <View style={styles.msgBlock}>
        <AppText variant="label" color="text">
          {t('businessJoin.message')}
        </AppText>
        <AppText variant="label" color="textMuted" style={styles.optional}>
          {t('businessJoin.messageOptional')}
        </AppText>
        <TextInput
          value={message}
          onChangeText={(v) => {
            setMessage(v);
            clearError('message');
          }}
          placeholder={t('businessJoin.messagePh')}
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          textAlign={textAlignStart(isRTL)}
          style={[
            styles.msgInput,
            inputTextStyle(locale),
            { writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr' },
          ]}
        />
        {errors.message ? (
          <AppText variant="label" color="error" style={styles.inlineErr}>
            {errors.message}
          </AppText>
        ) : null}
      </View>

      {submitError ? (
        <AppText variant="body" color="error" style={styles.bannerErr}>
          {submitError}
        </AppText>
      ) : null}

      <PrimaryButton
        title={t('businessJoin.submit')}
        onPress={() => void submit()}
        loading={busy || !listsReady}
      />

      <AppText variant="caption" color="textMuted" style={styles.disclaimer}>
        {t('businessJoin.disclaimerLive')}
      </AppText>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: 0, paddingBottom: spacing.xxxl },
    inlineErr: { marginTop: -spacing.sm, marginBottom: spacing.sm },
    msgBlock: { marginBottom: spacing.md, gap: 6 },
    optional: { marginBottom: 2 },
    msgInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text,
      backgroundColor: colors.surface,
      minHeight: 120,
    },
    bannerErr: { marginBottom: spacing.sm, lineHeight: 22 },
    disclaimer: { lineHeight: 18, marginTop: spacing.sm },
  });
}
