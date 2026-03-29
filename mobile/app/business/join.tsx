import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radii, spacing } from '@/theme';

export default function BusinessJoinScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const submit = () => {
    Alert.alert(t('membership.mockTitle'), t('businessJoin.disclaimer'));
  };

  return (
    <Screen scroll contentStyle={styles.pad} edges={['top', 'left', 'right', 'bottom']}>
      <DetailHeader title={t('businessJoin.title')} />
      <AppText variant="body" color="textSecondary">
        {t('businessJoin.subtitle')}
      </AppText>

      <LabeledField label={t('businessJoin.company')} placeholder={t('businessJoin.companyPh')} value={company} onChange={setCompany} />
      <LabeledField label={t('businessJoin.email')} placeholder={t('businessJoin.emailPh')} value={email} onChange={setEmail} keyboard="email-address" />
      <LabeledField label={t('businessJoin.phone')} placeholder={t('businessJoin.phonePh')} value={phone} onChange={setPhone} keyboard="phone-pad" />
      <LabeledField label={t('businessJoin.category')} placeholder={t('businessJoin.categoryPh')} value={category} onChange={setCategory} />
      <LabeledField
        label={t('businessJoin.message')}
        placeholder={t('businessJoin.messagePh')}
        value={message}
        onChange={setMessage}
        multiline
      />

      <PrimaryButton title={t('businessJoin.submit')} onPress={submit} />

      <AppText variant="caption" color="textMuted" style={styles.disclaimer}>
        {t('businessJoin.disclaimer')}
      </AppText>

      <Pressable onPress={() => router.back()} style={styles.backLink} hitSlop={12}>
        <AppText variant="meta" color="accent">
          {t('common.back')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

function LabeledField({
  label,
  placeholder,
  value,
  onChange,
  keyboard,
  multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboard ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={[styles.input, multiline && styles.inputMulti]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
  field: { gap: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  inputMulti: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disclaimer: { lineHeight: 18 },
  backLink: { textAlign: 'center', marginTop: spacing.sm },
});
