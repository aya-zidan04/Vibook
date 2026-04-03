import type { NotificationItem, Voucher } from '@/types';
import type { User } from '@/types';
import type { NotificationResponseDto, VoucherResponseDto } from '@/services/api/types';

export function dtoTierToUi(tier: string): User['membershipTier'] {
  const x = tier.toUpperCase();
  if (x === 'PLATINUM') return 'platinum';
  if (x === 'GOLD') return 'gold';
  return 'standard';
}

export function uiTierRank(tier: User['membershipTier']): number {
  if (tier === 'platinum') return 2;
  if (tier === 'gold') return 1;
  return 0;
}

export function dtoTierRank(tier: string): number {
  return uiTierRank(dtoTierToUi(tier));
}

export function toNum(v: number | string | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function voucherResponseToVoucher(v: VoucherResponseDto): Voucher {
  const dt = v.discountType?.toLowerCase() === 'fixed' ? 'fixed' : 'percent';
  return {
    id: v.id,
    code: v.code,
    title: v.title,
    titleAr: v.titleAr ?? undefined,
    discountValue: toNum(v.discountValue),
    discountType: dt,
    expiresAt: v.expiresAt,
    redeemed: v.redeemed,
  };
}

const NOTIF_KINDS = new Set<NotificationItem['kind']>([
  'booking',
  'promo',
  'reminder',
  'price',
  'wishlist',
]);

export function notificationResponseToItem(n: NotificationResponseDto): NotificationItem {
  const k = n.kind?.toLowerCase() ?? 'promo';
  const kind: NotificationItem['kind'] = NOTIF_KINDS.has(k as NotificationItem['kind'])
    ? (k as NotificationItem['kind'])
    : 'promo';
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt,
    read: n.read,
    kind,
  };
}

/** Backend only exposes monthly price; match mock “yearly save” pattern for comparison UI. */
export function estimatedYearlyFromMonthlyMonthly(monthly: number): number {
  return Math.round(monthly * 10 * 100) / 100;
}
