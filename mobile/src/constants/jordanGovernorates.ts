/**
 * Jordan’s 12 governorates — canonical order (roughly north→south).
 * `en` / `ar` align with `explore.gov.*` in the i18n dictionary.
 */
export const JORDAN_GOVERNORATES = [
  { slug: 'irbid', en: 'Irbid', ar: 'إربد' },
  { slug: 'ajloun', en: 'Ajloun', ar: 'عجلون' },
  { slug: 'jerash', en: 'Jerash', ar: 'جرش' },
  { slug: 'mafraq', en: 'Mafraq', ar: 'المفرق' },
  { slug: 'amman', en: 'Amman', ar: 'عمّان' },
  { slug: 'zarqa', en: 'Zarqa', ar: 'الزرقاء' },
  { slug: 'balqa', en: 'Balqa', ar: 'البلقاء' },
  { slug: 'madaba', en: 'Madaba', ar: 'مادبا' },
  { slug: 'karak', en: 'Karak', ar: 'الكرك' },
  { slug: 'tafileh', en: 'Tafileh', ar: 'الطفيلة' },
  { slug: 'maan', en: "Ma'an", ar: 'معان' },
  { slug: 'aqaba', en: 'Aqaba', ar: 'العقبة' },
] as const;

export type JordanGovernorateSlug = (typeof JORDAN_GOVERNORATES)[number]['slug'];

/** Migrate legacy header label and fix unknown persisted values. */
export function normalizeGovernorateLabel(label: string): string {
  if (label === 'Jordan') return 'Amman';
  if (JORDAN_GOVERNORATES.some((g) => g.en === label)) return label;
  return 'Amman';
}
