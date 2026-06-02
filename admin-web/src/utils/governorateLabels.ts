type JordanGovernorateSlug =
  | 'irbid'
  | 'ajloun'
  | 'jerash'
  | 'mafraq'
  | 'amman'
  | 'zarqa'
  | 'balqa'
  | 'madaba'
  | 'karak'
  | 'tafileh'
  | 'maan'
  | 'aqaba';

const JORDAN_GOVERNORATES: ReadonlyArray<{ slug: JordanGovernorateSlug; en: string; ar: string }> = [
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
];

const BACKEND_NAME_TO_SLUG: Record<string, JordanGovernorateSlug> = {
  Irbid: 'irbid',
  Ajloun: 'ajloun',
  Jerash: 'jerash',
  Mafraq: 'mafraq',
  Amman: 'amman',
  Zarqa: 'zarqa',
  Balqa: 'balqa',
  Madaba: 'madaba',
  Karak: 'karak',
  Tafileh: 'tafileh',
  Maan: 'maan',
  "Ma'an": 'maan',
  Aqaba: 'aqaba',
};

function backendGovernorateNameToSlug(name: string | null | undefined): JordanGovernorateSlug | undefined {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return undefined;
  const mapped = BACKEND_NAME_TO_SLUG[trimmed];
  if (mapped) return mapped;
  const byEn = JORDAN_GOVERNORATES.find((g) => g.en === trimmed);
  return byEn?.slug;
}

function governorateLabel(slug: JordanGovernorateSlug, locale: 'en' | 'ar'): string {
  const row = JORDAN_GOVERNORATES.find((g) => g.slug === slug);
  if (!row) return slug;
  return locale === 'ar' ? row.ar : row.en;
}

export function localizedGovernorateName(
  backendName: string | null | undefined,
  locale: 'en' | 'ar',
): string {
  const slug = backendGovernorateNameToSlug(backendName);
  if (slug) return governorateLabel(slug, locale);
  return (backendName ?? '').trim();
}
