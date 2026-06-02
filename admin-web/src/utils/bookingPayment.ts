import type { AdminBookingPaymentInfo } from '@/api/types';

export function formatPaymentAmount(payment: AdminBookingPaymentInfo): string {
  return `${payment.amount} ${payment.currency}`;
}
