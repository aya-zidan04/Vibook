/**
 * Canonical partner verticals for business profile (stored `profile.category` = English `en` string).
 */
export const BUSINESS_PARTNER_CATEGORIES = [
  { slug: 'events', en: 'Events & experiences' },
  { slug: 'dining', en: 'Restaurants & dining' },
  { slug: 'stays', en: 'Hotels & stays' },
  { slug: 'wellness', en: 'Wellness & spa' },
  { slug: 'nightlife', en: 'Nightlife & entertainment' },
  { slug: 'sports', en: 'Sports & venues' },
  { slug: 'culture', en: 'Arts & culture' },
  { slug: 'tours', en: 'Tours & travel' },
  { slug: 'retail', en: 'Retail & shopping' },
  { slug: 'other', en: 'Other' },
] as const;

export type BusinessPartnerCategorySlug = (typeof BUSINESS_PARTNER_CATEGORIES)[number]['slug'];

export function partnerCategoryRowForStored(stored: string) {
  const t = stored.trim();
  return BUSINESS_PARTNER_CATEGORIES.find((c) => c.en === t);
}
