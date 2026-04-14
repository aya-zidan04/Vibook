import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EventPhotosField } from '@/components/business/EventPhotosField';
import { BusinessIconMultiline, BusinessIconTextField } from '@/components/business/BusinessFormField';
import { GovernorateSelectField } from '@/components/forms/GovernorateSelectField';
import { BUSINESS_PARTNER_CATEGORIES } from '@/constants/businessPartnerCategories';
import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { radii, spacing, useThemeColors } from '@/theme';

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

const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? 0 : 30;
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`;
});

const CALENDAR_WEEKDAY_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const CALENDAR_WEEKDAY_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] as const;

export default function BusinessEventEditorScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isNew = id === 'new';
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(), []);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const events = useBusinessHubStore((s) => s.events);
  const addEvent = useBusinessHubStore((s) => s.addEvent);
  const updateEvent = useBusinessHubStore((s) => s.updateEvent);
  const removeEvent = useBusinessHubStore((s) => s.removeEvent);

  const existing = !isNew ? events.find((e) => e.id === id) : undefined;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [governorateSlug, setGovernorateSlug] = useState<JordanGovernorateSlug>('amman');
  const [mapsUrl, setMapsUrl] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);
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
    if (existing) {
      setTitle(existing.title);
      setCategory(existing.category);
      setDescription(existing.description);
      setDate(existing.date);
      setTimeSlots(parseStoredTimes(existing.time));
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
      time: timeSlots.join(', '),
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
        placeholder="YYYY-MM-DD"
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
        value={timeSlots.join(', ')}
        placeholder="12:00 PM"
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
                <AppText variant="bodyMedium" color="text" style={styles.sheetLabel}>
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
        {TIME_OPTIONS.map((opt) => {
          const selected = timeSlots.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => {
                setTimeSlots((prev) =>
                  prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt],
                );
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
              <AppText variant="bodyMedium" color="text" style={styles.sheetLabel}>
                {opt}
              </AppText>
              {selected ? (
                <Ionicons name="checkmark-circle" size={21} color={colors.accent} />
              ) : (
                <View style={[styles.sheetRadio, { borderColor: colors.borderLight }]} />
              )}
            </Pressable>
          );
        })}
        <PrimaryButton title="Done" onPress={() => setTimeSheetOpen(false)} style={styles.timeSheetBtn} />
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
  const styles = useMemo(() => createStyles(), []);
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

          <View style={styles.calendarHeadRow}>
            <Pressable
              onPress={() => onChangeMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1))}
              style={styles.calendarNavBtn}
            >
              <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
            </Pressable>
            <AppText variant="bodyMedium" color="text">
              {monthLabel}
            </AppText>
            <Pressable
              onPress={() => onChangeMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1))}
              style={styles.calendarNavBtn}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.calendarWeekRow}>
            {weekdayLabels.map((w) => (
              <View key={w} style={styles.calendarWeekCell}>
                <AppText variant="meta" color="textMuted">
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
  onPress,
  trailingIcon = 'chevron-down',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(), []);
  const { isRTL } = useTranslation();

  return (
    <View style={styles.pickerWrap}>
      <AppText variant="caption" color="text" style={styles.pickerLabel}>
        {label}
      </AppText>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pickerRow,
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
          style={[styles.pickerValue, { textAlign: isRTL ? 'right' : 'left' }]}
          numberOfLines={1}
        >
          {value.trim() || placeholder || ''}
        </AppText>
        <Ionicons name={trailingIcon} size={18} color={colors.textMuted} />
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
  const styles = useMemo(() => createStyles(), []);
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
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => TIME_OPTIONS.includes(s));
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
    pickerWrap: { gap: spacing.xs, marginBottom: spacing.md },
    pickerLabel: { fontWeight: '600' },
    pickerRow: {
      minHeight: 54,
      borderRadius: radii.xl,
      borderWidth: 1,
      flexDirection: 'row',
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
    modalTitle: { marginBottom: spacing.md, letterSpacing: 0.8 },
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
      borderRadius: radii.lg,
      borderWidth: 1,
      paddingVertical: 12,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    sheetRowSelected: { borderColor: '#A56B4A' },
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
      borderColor: '#A56B4A',
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
    timeSheetActions: {
      marginTop: spacing.sm,
      paddingBottom: spacing.xs,
    },
    timeSheetBtn: { marginTop: spacing.sm },
  });
}
