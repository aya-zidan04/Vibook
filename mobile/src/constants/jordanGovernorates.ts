/** Canonical English names (persisted in locale store). Order matches common north-to-south listing. */
export const JORDAN_GOVERNORATES = [
  { slug: 'irbid', en: 'Irbid' },
  { slug: 'ajloun', en: 'Ajloun' },
  { slug: 'jerash', en: 'Jerash' },
  { slug: 'mafraq', en: 'Mafraq' },
  { slug: 'amman', en: 'Amman' },
  { slug: 'zarqa', en: 'Zarqa' },
  { slug: 'balqa', en: 'Balqa' },
  { slug: 'madaba', en: 'Madaba' },
  { slug: 'karak', en: 'Karak' },
  { slug: 'tafileh', en: 'Tafileh' },
  { slug: 'maan', en: "Ma'an" },
  { slug: 'aqaba', en: 'Aqaba' },
] as const;

export type JordanGovernorateSlug = (typeof JORDAN_GOVERNORATES)[number]['slug'];

/** Migrate legacy header label and fix unknown persisted values. */
export function normalizeGovernorateLabel(label: string): string {
  if (label === 'Jordan') return 'Amman';
  if (JORDAN_GOVERNORATES.some((g) => g.en === label)) return label;
  return 'Amman';
}
