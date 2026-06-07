export const EVENT_TITLE_MIN = 3;
export const EVENT_TITLE_MAX = 255;
export const EVENT_DESC_MIN = 10;
export const EVENT_DESC_MAX = 4000;
export const EVENT_MAPS_MAX = 512;
export const EVENT_PHOTOS_MIN = 1;
export const EVENT_PHOTOS_MAX = 12;

export type BusinessEventFormErrors = {
  title?: string;
  category?: string;
  description?: string;
  date?: string;
  timeSlots?: string;
  priceJod?: string;
  capacity?: string;
  photos?: string;
  mapsUrl?: string;
};

export type BusinessEventFormInput = {
  title: string;
  category: string;
  description: string;
  date: string;
  selectedTimeSlots: string[];
  priceStr: string;
  capacity: string;
  mapsUrl: string;
  photoCount: number;
};

export function todayIsoDateLocal(): string {
  const d = new Date();
  return isoDateFromLocalParts(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isoDateFromLocalParts(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${m}-${dd}`;
}

export function isPastIsoDate(iso: string): boolean {
  const v = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return true;
  return v < todayIsoDateLocal();
}

export function parsePriceJod(priceStr: string): number | null {
  const t = priceStr.trim();
  if (!t.length) return null;
  const n = parseFloat(t.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function parseCapacity(capacity: string): number | null {
  const digits = capacity.trim().replace(/\D/g, '');
  if (!digits.length) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

type ValidateOpts = {
  t: (key: string) => string;
};

export function validateBusinessEventForm(
  input: BusinessEventFormInput,
  { t }: ValidateOpts,
): BusinessEventFormErrors {
  const errors: BusinessEventFormErrors = {};
  const title = input.title.trim();
  if (title.length < EVENT_TITLE_MIN) {
    errors.title = t('businessHub.eventValidationTitle');
  } else if (title.length > EVENT_TITLE_MAX) {
    errors.title = t('businessHub.eventValidationTitleMax');
  }

  if (!input.category.trim()) {
    errors.category = t('businessHub.eventValidationCategory');
  }

  const desc = input.description.trim();
  if (desc.length < EVENT_DESC_MIN) {
    errors.description = t('businessHub.eventValidationDescriptionMin');
  } else if (desc.length > EVENT_DESC_MAX) {
    errors.description = t('businessHub.eventValidationDescriptionMax');
  }

  const dateTrim = input.date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTrim)) {
    errors.date = t('businessHub.eventValidationDate');
  } else if (isPastIsoDate(dateTrim)) {
    errors.date = t('businessHub.eventValidationDatePast');
  }

  if (input.selectedTimeSlots.length === 0) {
    errors.timeSlots = t('businessHub.eventValidationTime');
  }

  const priceTrim = input.priceStr.trim();
  const price = parsePriceJod(input.priceStr);
  if (!priceTrim.length || price === null || price < 0) {
    errors.priceJod = t('businessHub.eventValidationPrice');
  }

  const cap = parseCapacity(input.capacity);
  if (cap === null || cap < 1) {
    errors.capacity = t('businessHub.eventValidationCapacity');
  }

  if (input.photoCount < EVENT_PHOTOS_MIN) {
    errors.photos = t('businessHub.eventValidationPhotosMin');
  } else if (input.photoCount > EVENT_PHOTOS_MAX) {
    errors.photos = t('businessHub.eventValidationPhotosMax');
  }

  const maps = input.mapsUrl.trim();
  if (maps.length > EVENT_MAPS_MAX) {
    errors.mapsUrl = t('businessHub.eventValidationMapsMax');
  }

  return errors;
}

export function isBusinessEventFormValid(errors: BusinessEventFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
