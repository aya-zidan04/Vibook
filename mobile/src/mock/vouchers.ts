import type { Voucher } from '@/types';

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'VIBOOK15',
    title: '15% off experiences',
    titleAr: 'خصم ٪١٥ على التجارب',
    discountValue: 15,
    discountType: 'percent',
    expiresAt: '2026-06-30T23:59:59+03:00',
    redeemed: false,
  },
  {
    id: 'v2',
    code: 'DINE40',
    title: 'JOD 40 off dining',
    titleAr: 'خصم ٤٠ د.أ على المطاعم',
    discountValue: 40,
    discountType: 'fixed',
    expiresAt: '2026-04-30T23:59:59+03:00',
    redeemed: false,
  },
];
