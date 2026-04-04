import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EventPhotosField } from '@/components/business/EventPhotosField';
import { BusinessIconMultiline, BusinessIconTextField } from '@/components/business/BusinessFormField';
import { GovernorateSelectField } from '@/components/forms/GovernorateSelectField';
import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { radii, spacing, useThemeColors } from '@/theme';

export default function BusinessEventEditorScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isNew = id === 'new';
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(), []);
  const router = useRouter();
  const { t } = useTranslation();
  const events = useBusinessHubStore((s) => s.events);
  const addEvent = useBusinessHubStore((s) => s.addEvent);
  const updateEvent = useBusinessHubStore((s) => s.updateEvent);
  const removeEvent = useBusinessHubStore((s) => s.removeEvent);

  const existing = !isNew ? events.find((e) => e.id === id) : undefined;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [governorateSlug, setGovernorateSlug] = useState<JordanGovernorateSlug>('amman');
  const [mapsUrl, setMapsUrl] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setCategory(existing.category);
      setDescription(existing.description);
      setDate(existing.date);
      setTime(existing.time);
      setGovernorateSlug(existing.governorateSlug);
      setMapsUrl(existing.mapsUrl);
      setPrice(existing.price);
      setCapacity(existing.capacity);
      setImageUris(parseStoredImages(existing.images));
      setHidden(existing.hidden);
    }
  }, [existing]);

  if (!isNew && !existing) {
    return (
      <Screen
        scroll
        contentStyle={styles.pad}
        header={<DetailHeader title={t('businessHub.eventEdit')} />}
      >
        <AppText variant="body" color="textSecondary">
          {t('businessHub.missingEvent')}
        </AppText>
      </Screen>
    );
  }

  const save = () => {
    const payload = {
      title: title.trim() || t('businessHub.eventUntitled'),
      category: category.trim() || t('businessHub.uncategorized'),
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      governorateSlug,
      mapsUrl: mapsUrl.trim(),
      price: price.trim(),
      capacity: capacity.trim(),
      images: imageUris.map((u) => u.trim()).filter(Boolean).join('\n'),
      listingId: isNew ? null : (existing?.listingId ?? null),
      hidden,
    };
    if (isNew) {
      const newId = addEvent(payload);
      router.replace(`/business/events/${newId}`);
    } else if (id) {
      updateEvent(id, payload);
      router.back();
    }
  };

  const del = () => {
    if (!id || isNew) return;
    Alert.alert(t('businessHub.deleteEvent'), '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('businessHub.deleteEvent'),
        style: 'destructive',
        onPress: () => {
          removeEvent(id);
          router.replace('/business/events');
        },
      },
    ]);
  };

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={
        <DetailHeader title={isNew ? t('businessHub.eventNew') : t('businessHub.eventEdit')} />
      }
    >
      <BusinessIconTextField
        icon="text-outline"
        label={t('businessHub.fieldTitle')}
        value={title}
        onChangeText={setTitle}
      />
      <BusinessIconTextField
        icon="pricetag-outline"
        label={t('businessHub.fieldCategory')}
        value={category}
        onChangeText={setCategory}
      />
      <BusinessIconMultiline
        icon="document-text-outline"
        label={t('businessHub.fieldDescription')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('businessHub.fieldDescriptionPh')}
        minHeight={112}
      />
      <BusinessIconTextField
        icon="calendar-outline"
        label={t('businessHub.fieldDate')}
        value={date}
        onChangeText={setDate}
      />
      <BusinessIconTextField
        icon="time-outline"
        label={t('businessHub.fieldTime')}
        value={time}
        onChangeText={setTime}
      />
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
      <BusinessIconTextField
        icon="cash-outline"
        label={t('businessHub.fieldPrice')}
        value={price}
        onChangeText={setPrice}
        keyboardType="number-pad"
      />
      <BusinessIconTextField
        icon="people-outline"
        label={t('businessHub.fieldCapacity')}
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="number-pad"
      />
      <EventPhotosField
        label={t('businessHub.fieldImages')}
        hint={t('businessHub.fieldImagesHint')}
        uris={imageUris}
        onUrisChange={setImageUris}
        addAccessibilityLabel={t('businessHub.eventPhotosAddA11y')}
        removeAccessibilityLabel={t('businessHub.eventPhotosRemoveA11y')}
        permissionTitle={t('businessHub.profilePhotoPermissionTitle')}
        permissionBody={t('businessHub.eventPhotosPermissionBody')}
      />
      <View style={[styles.switchRow, { borderColor: colors.borderLight, backgroundColor: colors.surfaceMuted }]}>
        <View style={styles.switchLeft}>
          <View style={[styles.switchIcon, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="eye-off-outline" size={18} color={colors.primary} />
          </View>
          <AppText variant="bodyMedium" color="text">
            {t('businessHub.fieldHidden')}
          </AppText>
        </View>
        <Switch value={hidden} onValueChange={setHidden} />
      </View>
      <PrimaryButton title={t('businessHub.save')} onPress={save} />
      {!isNew ? <SecondaryButton title={t('businessHub.deleteEvent')} onPress={del} /> : null}
    </Screen>
  );
}

function parseStoredImages(raw: string): string[] {
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function createStyles() {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      borderRadius: radii.xl,
      borderWidth: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    switchLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
      minWidth: 0,
    },
    switchIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
