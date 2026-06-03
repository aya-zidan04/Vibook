import type { BookingStatus } from '@/types';

export function canCancelBookingStatus(status: BookingStatus): boolean {
  return status === 'upcoming' || status === 'pending_payment';
}
