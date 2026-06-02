import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { EventPhotosField } from '@/components/business/EventPhotosField';
import { BusinessIconMultiline, BusinessIconTextField } from '@/components/business/BusinessFormField';
import { GovernorateSelectField } from '@/components/forms/GovernorateSelectField';
import { BUSINESS_PARTNER_CATEGORIES } from '@/constants/businessPartnerCategories';
import { canonicalizeToEventTimeSlot, EVENT_TIME_OPTIONS } from '@/constants/eventTimeSlots';
import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import {
  createMyBusinessEvent,
  deleteMyBusinessEvent,
  getMyBusinessEvent,
  updateMyBusinessEvent,
  type BusinessEventUpsertPayload,
} from '@/api/businessEventsApi';
import { listActiveGovernorates } from '@/api/governoratesApi';
import { refreshBusinessHubLists } from '@/services/businessHubSync';
import { radii, spacing, useThemeColors, type ThemeColors } from '@/theme';
import type { BusinessEventRecord } from '@/types/businessHub';
import { businessEventResponseToRecord, photoUrlsForApi } from '@/utils/businessHubMappers';
import { resolveGovernorateId } from '@/utils/resolveGovernorateId';
import { resolveSubcategoryIdForHubCategory } from '@/utils/resolveHubSubcategory';
import { leadingIconRowStyle, textAlignStart } from '@/utils/rtlText';
import { NavigationChevronPrev, NavigationChevronNext } from '@/components/ui/NavigationChevron';
import { navigationRowStyle } from '@/utils/rtl';
import { formatEventTimeSlotLabel } from '@/utils/formatEventTimeSlot';

type EventCategoryOption = {
  id: string;
  valueEn: string;
  labelEn: string;
  labelAr: string;
  icon: keyof typeof Ionicons.glyphMap;
  parentSlug: string;
};

type EventCategoryGroup = {
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: EventCategoryOption[];
};

const EVENT_CATEGORY_GROUPS: EventCategoryGroup[] = BUSINESS_PARTNER_CATEGORIES.map((c) => ({
  slug: c.slug,
  nameEn: c.en,
  nameAr: c.ar,
  icon: c.icon,
  options: c.partsEn.map((partEn, idx) => {
    const partAr = c.partsAr[idx] ?? partEn;
    return {
      id: `${c.slug}-${idx}`,
      valueEn: `${c.en} - ${partEn}`,
      labelEn: `${c.en} · ${partEn}`,
      labelAr: `${c.ar} · ${partAr}`,
      icon: c.icon,
      parentSlug: c.slug,
    };
  }),
}));

const EVENT_CATEGORY_OPTIONS: EventCategoryOption[] = EVENT_CATEGORY_GROUPS.flatMap((group) => group.options);

type TicketFormRow = {
  key: string;
  persistedId?: string;
  name: string;
  description: string;
  priceStr: string;
};

function newTicketRowKey(): string {
  return `tk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyTicketFormRow(): TicketFormRow {
  return { key: newTicketRowKey(), name: '', description: '', priceStr: '' };
}

const CALENDAR_WEEKDAY_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const CALENDAR_WEEKDAY_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] as const;

export default function BusinessEventEditorScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const segments = useSegments();
  const paramId = Array.isArray(rawId) ? rawId[0] : rawId;
  const tail = segments[segments.length - 1];
  const segmentId = typeof tail === 'string' ? tail : '';
  /** Params can be empty on the first paint; the file segment (e.g. `new` or event id) is still in `useSegments`. */
  const id = (paramId && String(paramId).length > 0 ? String(paramId) : segmentId) || '';
  const isNew = id === 'new';
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const numericEdit = !isNew && !!id && /^\d+$/.test(String(id));
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState(false);
  const [loadedRecord, setLoadedRecord] = useState<BusinessEventRecord | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  /** Canonical slot labels from {@link EVENT_TIME_OPTIONS}, plus any legacy tokens that could not be normalized. */
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [timeSlotsError, setTimeSlotsError] = useState(false);
  const [governorateSlug, setGovernorateSlug] = useState<JordanGovernorateSlug>('amman');
  const [mapsUrl, setMapsUrl] = useState('');
  const [ticketRows, setTicketRows] = useState<TicketFormRow[]>([emptyTicketFormRow()]);
  const [capacity, setCapacity] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveLockRef = useRef(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    saveLockRef.current = false;
    setSaving(false);
  }, [id]);

  useEffect(() => {
    if (!isNew) return;
    setLoadedRecord(null);
    setRemoteError(false);
    setTitle('');
    setCategory('');
    setDescription('');
    setDate('');
    setSelectedTimeSlots([]);
    setTimeSlotsError(false);
    setGovernorateSlug('amman');
    setMapsUrl('');
    setTicketRows([emptyTicketFormRow()]);
    setCapacity('');
    setImageUris([]);
    setHidden(false);
    setCalendarMonth(() => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, [isNew]);

  useEffect(() => {
    if (!numericEdit || !id) {
      if (!numericEdit) {
        setRemoteLoading(false);
        setRemoteError(false);
        setLoadedRecord(null);
      }
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    setRemoteError(false);
    setLoadedRecord(null);
    const nid = Number(id);
    void (async () => {
      try {
        const r = await getMyBusinessEvent(nid);
        if (cancelled) return;
        const rec = businessEventResponseToRecord(r);
        setLoadedRecord(rec);
        setTitle(rec.title);
        setCategory(rec.category);
        setDescription(rec.description);
        setDate(rec.date);
        setSelectedTimeSlots(parseStoredTimes(rec.time));
        setTimeSlotsError(false);
        setGovernorateSlug(rec.governorateSlug);
        setMapsUrl(rec.mapsUrl);
        setTicketRows(
          rec.ticketOptions?.length
            ? rec.ticketOptions.map((opt) => ({
                key: opt.id,
                persistedId: opt.id,
                name: opt.name,
                description: opt.description ?? '',
                priceStr: String(opt.priceJod),
              }))
            : [emptyTicketFormRow()],
        );
        setCapacity(String(rec.capacityGuests ?? ''));
        setImageUris(parseStoredImages(rec.images));
        setHidden(rec.hidden);
        const calBase = parseIsoDate(rec.date) ?? new Date();
        calBase.setDate(1);
        calBase.setHours(0, 0, 0, 0);
        setCalendarMonth(calBase);
      } catch {
        if (!cancelled) {
          setRemoteError(true);
          setLoadedRecord(null);
        }
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numericEdit, id]);

  if (!id) {
    return (
      <Screen
        scroll
        contentStyle={styles.pad}
        header={<DetailHeader title={t('common.loading')} />}
      >
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (numericEdit && remoteLoading) {
    return (
      <Screen
        scroll
        contentStyle={styles.pad}
        header={<DetailHeader title={t('businessHub.eventEdit')} />}
      >
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (numericEdit && (remoteError || loadedRecord == null)) {
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

  const save = async () => {
    if (saveLockRef.current || saving) return;
    if (!category.trim()) {
      Alert.alert(t('common.error'), t('businessHub.eventValidationCategory'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('businessHub.eventValidationDescription'));
      return;
    }
    const dateTrim = date.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTrim)) {
      Alert.alert(t('common.error'), t('businessHub.eventValidationDate'));
      return;
    }
    if (selectedTimeSlots.length === 0) {
      setTimeSlotsError(true);
      return;
    }
    setTimeSlotsError(false);
    if (ticketRows.length === 0) {
      Alert.alert(t('common.error'), t('businessHub.eventValidationTickets'));
      return;
    }
    for (const row of ticketRows) {
      if (!row.name.trim()) {
        Alert.alert(t('common.error'), t('businessHub.eventValidationTicketName'));
        return;
      }
      const p = parseFloat(row.priceStr.replace(/[^\d.]/g, ''));
      if (!Number.isFinite(p) || p < 0) {
        Alert.alert(t('common.error'), t('businessHub.eventValidationTicketPrice'));
        return;
      }
    }
    const capNum = parseInt(capacity.replace(/\D/g, ''), 10);
    if (!Number.isFinite(capNum) || capNum < 1) {
      Alert.alert(t('common.error'), t('businessHub.eventValidationCapacity'));
      return;
    }

    const baseTicketIds = Date.now();
    const ticketOptions = ticketRows.map((row, idx) => {
      const priceJod = parseFloat(row.priceStr.replace(/[^\d.]/g, ''));
      return {
        id: row.persistedId ?? `tkt-${baseTicketIds}-${idx}`,
        name: row.name.trim(),
        description: row.description.trim() || undefined,
        priceJod,
        currency: 'JOD' as const,
      };
    });

    saveLockRef.current = true;
    setSaving(true);
    try {
      const subcategoryId =
        (await resolveSubcategoryIdForHubCategory(category.trim())) ?? loadedRecord?.apiSubcategoryId ?? null;
      if (subcategoryId == null) {
        Alert.alert(t('common.error'), t('businessHub.eventValidationCategory'));
        return;
      }
      const govs = await listActiveGovernorates();
      const governorateId = resolveGovernorateId(govs, governorateSlug);
      if (governorateId == null) {
        Alert.alert(t('common.error'), t('businessHub.eventGovernorateError'));
        return;
      }
      const priceJod = String(ticketOptions[0]?.priceJod ?? '');
      const apiPayload: BusinessEventUpsertPayload = {
        title: title.trim() || t('businessHub.eventUntitled'),
        subcategoryId,
        description: description.trim(),
        eventDate: dateTrim,
        timeSlots: selectedTimeSlots.map((slot) => canonicalizeToEventTimeSlot(slot) ?? slot),
        governorateId,
        googleMapsUrl: mapsUrl.trim() ? mapsUrl.trim() : null,
        priceJod,
        currency: 'JOD',
        capacityGuests: capNum,
        hidden,
        photoUrls: (() => {
          const urls = photoUrlsForApi(imageUris);
          return urls.length ? urls : null;
        })(),
      };
      if (isNew) {
        const created = await createMyBusinessEvent(apiPayload);
        await refreshBusinessHubLists();
        router.replace(`/business/events/${created.id}`);
      } else if (id && /^\d+$/.test(String(id))) {
        await updateMyBusinessEvent(Number(id), apiPayload);
        await refreshBusinessHubLists();
        router.back();
      }
    } catch {
      Alert.alert(t('common.error'), t('businessHub.eventSaveError'));
    } finally {
      saveLockRef.current = false;
      setSaving(false);
    }
  };

  const del = () => {
    if (!id || isNew) return;
    const nid = Number(id);
    if (!Number.isFinite(nid)) return;
    Alert.alert(t('businessHub.deleteEvent'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('businessHub.deleteEvent'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteMyBusinessEvent(nid);
              await refreshBusinessHubLists();
              router.replace('/business/events');
            } catch {
              Alert.alert(t('common.error'), t('businessHub.eventSaveError'));
            }
          })();
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
      <PickerField
        icon={selectedCategoryOption(category)?.icon ?? 'pricetag-outline'}
        label={t('businessHub.fieldCategory')}
        value={
          selectedCategoryOption(category)
            ? localeLabel(selectedCategoryOption(category)!, locale)
            : category
        }
        placeholder={t('businessHub.profileCategorySheet')}
        onPress={() => setCategorySheetOpen(true)}
        trailingIcon="chevron-down"
      />
      <BusinessIconMultiline
        icon="document-text-outline"
        label={t('businessHub.fieldDescription')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('businessHub.fieldDescriptionPh')}
        minHeight={112}
      />
      <PickerField
        icon="calendar-outline"
        label={t('businessHub.fieldDate')}
        value={date}
        placeholder={t('businessHub.fieldDatePh')}
        onPress={() => {
          const base = parseIsoDate(date) ?? new Date();
          base.setDate(1);
          base.setHours(0, 0, 0, 0);
          setCalendarMonth(base);
          setDateSheetOpen(true);
        }}
        trailingIcon="chevron-down"
      />
      <PickerField
        icon="time-outline"
        label={t('businessHub.fieldTime')}
        value={selectedTimeSlots.map((s) => formatEventTimeSlotLabel(s, locale)).join(', ')}
        placeholder={t('businessHub.fieldTimePh')}
        errorText={timeSlotsError ? t('businessHub.eventValidationTime') : undefined}
        onPress={() => setTimeSheetOpen(true)}
        trailingIcon="chevron-down"
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
      <AppText variant="label" color="text" style={styles.ticketsSectionLabel}>
        {t('businessHub.fieldTicketsSection')}
      </AppText>
      {ticketRows.map((row, index) => (
        <View
          key={row.key}
          style={[
            styles.ticketCard,
            { borderColor: colors.borderLight, backgroundColor: colors.surfaceMuted },
          ]}
        >
          <View style={styles.ticketCardHead}>
            <AppText variant="caption" color="textMuted">
              {t('businessHub.ticketOptionLabel').replace('{n}', String(index + 1))}
            </AppText>
            {ticketRows.length > 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('businessHub.removeTicketTypeA11y')}
                hitSlop={10}
                onPress={() =>
                  setTicketRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== row.key)))
                }
              >
                <Ionicons name="trash-outline" size={20} color={colors.icon} />
              </Pressable>
            ) : null}
          </View>
          <BusinessIconTextField
            icon="pricetag-outline"
            label={t('businessHub.fieldTicketName')}
            value={row.name}
            onChangeText={(text) =>
              setTicketRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, name: text } : r)))
            }
            placeholder={t('businessHub.ticketNamePlaceholder')}
          />
          <BusinessIconMultiline
            icon="list-outline"
            label={t('businessHub.fieldTicketDescription')}
            value={row.description}
            onChangeText={(text) =>
              setTicketRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, description: text } : r)))
            }
            placeholder=""
            minHeight={72}
          />
          <BusinessIconTextField
            icon="cash-outline"
            label={t('businessHub.fieldTicketPrice')}
            value={row.priceStr}
            onChangeText={(text) =>
              setTicketRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, priceStr: text } : r)))
            }
            keyboardType="number-pad"
          />
        </View>
      ))}
      <SecondaryButton
        title={t('businessHub.addTicketType')}
        onPress={() => setTicketRows((prev) => [...prev, emptyTicketFormRow()])}
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
          <AppText variant="body-em" color="text">
            {t('businessHub.fieldHidden')}
          </AppText>
        </View>
        <Switch value={hidden} onValueChange={setHidden} />
      </View>
      <PrimaryButton
        title={t('businessHub.save')}
        onPress={() => {
          void save();
        }}
        disabled={saving}
        loading={saving}
      />
      {!isNew ? <SecondaryButton title={t('businessHub.deleteEvent')} onPress={del} /> : null}

      <CalendarDateSheet
        visible={dateSheetOpen}
        title={t('businessHub.fieldDate')}
        selectedIsoDate={date}
        month={calendarMonth}
        locale={locale}
        onChangeMonth={setCalendarMonth}
        onClose={() => setDateSheetOpen(false)}
        onSelectDate={(isoDate) => {
          setDate(isoDate);
          setDateSheetOpen(false);
        }}
      />

      <BottomListSheet
        visible={categorySheetOpen}
        title={t('businessHub.profileCategorySheet')}
        onClose={() => setCategorySheetOpen(false)}
      >
        <View style={styles.categoryGroupsWrap}>
          {EVENT_CATEGORY_GROUPS.map((group) => (
            <View
              key={group.slug}
              style={[
                styles.categoryGroupCard,
                { borderColor: colors.border, backgroundColor: colors.backgroundElevated },
              ]}
            >
              <View style={styles.categoryGroupHead}>
                <View style={[styles.sheetIconWrap, { backgroundColor: colors.primaryMuted, borderRadius: 10 }]}>
                  <Ionicons name={group.icon} size={16} color={colors.primary} />
                </View>
                <AppText variant="body-em" color="text" style={styles.sheetLabel}>
                  {locale === 'ar' ? group.nameAr : group.nameEn}
                </AppText>
              </View>

              <View style={styles.categoryChipsRow}>
                {group.options.map((opt) => {
                  const selected = category.trim() === opt.valueEn;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => {
                        setCategory(opt.valueEn);
                        setCategorySheetOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.categoryChip,
                        selected && styles.categoryChipSelected,
                        pressed && styles.sheetRowPressed,
                        {
                          borderColor: selected ? colors.primary : colors.borderLight,
                          backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        color={selected ? 'textOnPrimary' : 'text'}
                        style={styles.categoryChipLabel}
                      >
                        {locale === 'ar'
                          ? opt.labelAr.replace(`${group.nameAr} · `, '')
                          : opt.labelEn.replace(`${group.nameEn} · `, '')}
                      </AppText>
                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={colors.textOnPrimary}
                          style={styles.categoryChipCheck}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </BottomListSheet>

      <BottomListSheet
        visible={timeSheetOpen}
        title={t('businessHub.fieldTime')}
        onClose={() => setTimeSheetOpen(false)}
      >
        {selectedTimeSlots.filter((s) => !EVENT_TIME_OPTIONS.includes(s)).map((slot) => (
          <Pressable
            key={`legacy-${slot}`}
            accessibilityRole="button"
            accessibilityState={{ selected: true }}
            onPress={() => {
              setSelectedTimeSlots((prev) => {
                const next = prev.filter((v) => v !== slot);
                if (next.length > 0) setTimeSlotsError(false);
                return next;
              });
            }}
            style={({ pressed }) => [
              styles.sheetRow,
              styles.sheetRowSelected,
              pressed && styles.sheetRowPressed,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primaryMuted,
              },
            ]}
          >
            <View style={styles.sheetIconWrap}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
            </View>
            <AppText variant="body-em" color="text" style={styles.sheetLabel}>
              {formatEventTimeSlotLabel(slot, locale)}
            </AppText>
            <Ionicons name="checkmark-circle" size={21} color={colors.primaryLight} />
          </Pressable>
        ))}
        {EVENT_TIME_OPTIONS.map((opt) => {
          const selected = selectedTimeSlots.includes(opt);
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setSelectedTimeSlots((prev) => {
                  const next = prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt];
                  if (next.length > 0) setTimeSlotsError(false);
                  return next;
                });
              }}
              style={({ pressed }) => [
                styles.sheetRow,
                selected && styles.sheetRowSelected,
                pressed && styles.sheetRowPressed,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primaryMuted : colors.backgroundElevated,
                },
              ]}
            >
              <View style={styles.sheetIconWrap}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <AppText variant="body-em" color="text" style={styles.sheetLabel}>
                {formatEventTimeSlotLabel(opt, locale)}
              </AppText>
              {selected ? (
                <Ionicons name="checkmark-circle" size={21} color={colors.primaryLight} />
              ) : (
                <View style={[styles.sheetRadio, { borderColor: colors.borderLight }]} />
              )}
            </Pressable>
          );
        })}
        <PrimaryButton title={t('common.ok')} onPress={() => setTimeSheetOpen(false)} style={styles.timeSheetBtn} />
      </BottomListSheet>

    </Screen>
  );
}

function selectedCategoryOption(category: string): EventCategoryOption | undefined {
  const c = category.trim();
  if (!c) return undefined;
  return EVENT_CATEGORY_OPTIONS.find((opt) => opt.valueEn === c);
}

function localeLabel(
  option: Pick<EventCategoryOption, 'labelEn' | 'labelAr'>,
  locale: 'en' | 'ar',
): string {
  return locale === 'ar' ? option.labelAr : option.labelEn;
}

function displayDateLabel(isoDate: string, locale: 'en' | 'ar'): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const localeTag = locale === 'ar' ? 'ar-JO' : 'en-US';
  return `${isoDate} · ${d.toLocaleDateString(localeTag, { weekday: 'short', month: 'short', day: 'numeric' })}`;
}

function parseIsoDate(raw: string): Date | null {
  const v = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function isoDateFromParts(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${m}-${dd}`;
}

function CalendarDateSheet({
  visible,
  title,
  selectedIsoDate,
  month,
  locale,
  onChangeMonth,
  onClose,
  onSelectDate,
}: {
  visible: boolean;
  title: string;
  selectedIsoDate: string;
  month: Date;
  locale: 'en' | 'ar';
  onChangeMonth: (d: Date) => void;
  onClose: () => void;
  onSelectDate: (isoDate: string) => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isRTL = locale === 'ar';
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthLabel = monthStart.toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const weekdayLabels = locale === 'ar' ? CALENDAR_WEEKDAY_AR : CALENDAR_WEEKDAY_EN;
  const selected = selectedIsoDate.trim();
  const today = new Date();
  const todayIso = isoDateFromParts(today.getFullYear(), today.getMonth(), today.getDate());

  const dayCells: Array<{ key: string; day?: number; iso?: string }> = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    dayCells.push({ key: `blank-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    dayCells.push({
      key: `day-${day}`,
      day,
      iso: isoDateFromParts(monthStart.getFullYear(), monthStart.getMonth(), day),
    });
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <AppText variant="overline" color="textMuted" style={styles.modalTitle}>
            {title}
          </AppText>

          <View style={[styles.calendarHeadRow, navigationRowStyle(isRTL)]}>
            <Pressable
              onPress={() => onChangeMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1))}
              style={styles.calendarNavBtn}
            >
              <NavigationChevronPrev size={18} color={colors.icon} />
            </Pressable>
            <AppText variant="body-em" color="text">
              {monthLabel}
            </AppText>
            <Pressable
              onPress={() => onChangeMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1))}
              style={styles.calendarNavBtn}
            >
              <NavigationChevronNext size={18} color={colors.icon} />
            </Pressable>
          </View>

          <View style={styles.calendarWeekRow}>
            {weekdayLabels.map((w) => (
              <View key={w} style={styles.calendarWeekCell}>
                <AppText variant="label" color="textMuted">
                  {w}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {dayCells.map((cell) => {
              if (!cell.iso || !cell.day) return <View key={cell.key} style={styles.calendarDayCell} />;
              const isSelected = selected === cell.iso;
              const isToday = todayIso === cell.iso;
              return (
                <Pressable
                  key={cell.key}
                  onPress={() => onSelectDate(cell.iso!)}
                  style={[
                    styles.calendarDayCell,
                    styles.calendarDayBtn,
                    isToday && !isSelected && { borderColor: colors.primary, borderWidth: 1.5 },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <AppText variant="body" color={isSelected ? 'textOnPrimary' : 'text'}>
                    {String(cell.day)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="caption" color="textMuted" style={styles.calendarSelectedHint}>
            {selected ? displayDateLabel(selected, locale) : ' '}
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

function PickerField({
  icon,
  label,
  value,
  placeholder,
  errorText,
  onPress,
  trailingIcon = 'chevron-down',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  placeholder?: string;
  errorText?: string;
  onPress: () => void;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isRTL } = useTranslation();

  return (
    <View style={styles.pickerWrap}>
      <AppText variant="label" color="text">
        {label}
      </AppText>
      {errorText ? (
        <AppText variant="caption" color="error" style={styles.pickerFieldError}>
          {errorText}
        </AppText>
      ) : null}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pickerRow,
          leadingIconRowStyle,
          {
            borderColor: colors.borderLight,
            backgroundColor: colors.surfaceMuted,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.pickerIcon, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <AppText
          variant="body"
          color={value.trim() ? 'text' : 'textMuted'}
          style={[styles.pickerValue, { textAlign: textAlignStart(isRTL) }]}
          numberOfLines={1}
        >
          {value.trim() || placeholder || ''}
        </AppText>
        <Ionicons name={trailingIcon} size={18} color={colors.icon} />
      </Pressable>
    </View>
  );
}

function BottomListSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <AppText variant="overline" color="textMuted" style={styles.modalTitle}>
            {title}
          </AppText>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function parseStoredImages(raw: string): string[] {
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseStoredTimes(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    const canon = canonicalizeToEventTimeSlot(part);
    const value = canon ?? part;
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
    ticketsSectionLabel: { marginBottom: -4 },
    ticketCard: {
      borderRadius: radii.xl,
      borderWidth: 1,
      padding: spacing.md,
      gap: spacing.sm,
    },
    ticketCardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
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
    pickerWrap: { gap: spacing.xs, marginBottom: spacing.md },
    pickerFieldError: { marginBottom: 2 },
    pickerRow: {
      minHeight: 54,
      borderRadius: radii.xl,
      borderWidth: 1,
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    pickerIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerValue: { flex: 1, minWidth: 0 },
    modalRoot: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalSheet: {
      borderTopLeftRadius: radii.xxl,
      borderTopRightRadius: radii.xxl,
      borderWidth: 1,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.screen,
      paddingBottom: spacing.xxxl,
      maxHeight: '62%',
    },
    modalTitle: { marginBottom: spacing.md },
    modalList: { flexGrow: 0 },
    calendarHeadRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    calendarNavBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calendarWeekRow: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
    },
    calendarWeekCell: {
      width: '14.2857%',
      alignItems: 'center',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.sm,
    },
    calendarDayCell: {
      width: '14.2857%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    calendarDayBtn: {
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    calendarSelectedHint: {
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: spacing.xs,
    },
    sheetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radii.full,
      borderWidth: 1,
      paddingVertical: 12,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    sheetRowSelected: { borderColor: colors.primary },
    sheetRowPressed: { opacity: 0.9 },
    sheetIconWrap: { width: 28, alignItems: 'center', justifyContent: 'center' },
    sheetLabel: { flex: 1 },
    categoryGroupsWrap: {
      gap: spacing.sm,
      paddingBottom: spacing.xs,
    },
    categoryGroupCard: {
      borderWidth: 1,
      borderRadius: radii.xl,
      padding: spacing.sm,
      gap: spacing.sm,
    },
    categoryGroupHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    categoryChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    categoryChip: {
      minHeight: 34,
      borderRadius: radii.full,
      borderWidth: 1,
      paddingVertical: 7,
      paddingHorizontal: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    categoryChipSelected: {
      borderColor: colors.primary,
    },
    categoryChipLabel: {
      lineHeight: 16,
    },
    categoryChipCheck: {
      marginTop: 0.5,
    },
    sheetRadio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
    },
    timeSheetBtn: { marginTop: spacing.sm },
  });
}
