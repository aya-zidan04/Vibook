import type { GovernorateResponse } from '@/api/types';
import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';

/** Backend seeds {@code Maan} while mobile lists {@code Ma'an}. */
const MOBILE_EN_TO_BACKEND_NAME: Record<string, string> = {
  "Ma'an": 'Maan',
};

export function resolveGovernorateId(
  list: GovernorateResponse[],
  slug: JordanGovernorateSlug,
): number | undefined {
  const row = JORDAN_GOVERNORATES.find((g) => g.slug === slug);
  if (!row) return undefined;
  const backendName = MOBILE_EN_TO_BACKEND_NAME[row.en] ?? row.en;
  return list.find((g) => g.name === backendName)?.id;
}
