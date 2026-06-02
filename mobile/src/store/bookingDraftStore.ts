import { create } from 'zustand';

export type BookingDraft = {
  vertical: 'event' | 'restaurant' | 'stay' | 'experience' | 'package';
  refId: string;
  /** When set, checkout uses PayPal + `POST /api/v1/bookings` with this id. */
  apiEventId?: number;
  /** Optional API time slot for booking / PayPal create-order. */
  apiTimeSlotId?: number | null;
  title: string;
  /** Arabic listing title when known (optional for API create). */
  refTitleAr?: string;
  imageUrl: string;
  currency: string;
  unitPrice: number;
  quantity: number;
  fees: number;
  /** ISO 8601 start time for the booking (events, stays, etc.). */
  startsAt?: string;
  /** Display / API city (English). */
  cityName?: string;
  cityNameAr?: string;
  tierName?: string;
  metaLine?: string;
};

type State = {
  draft: BookingDraft | null;
  lastOrderId: string | null;
  /** Server booking id after `POST /bookings` (PENDING), before PayPal capture. */
  pendingBookingId: number | null;
  setDraft: (d: BookingDraft | null) => void;
  setLastOrderId: (id: string | null) => void;
  setPendingBookingId: (id: number | null) => void;
  clearCheckoutSession: () => void;
};

export const useBookingDraftStore = create<State>((set) => ({
  draft: null,
  lastOrderId: null,
  pendingBookingId: null,
  setDraft: (d) => set({ draft: d }),
  setLastOrderId: (id) => set({ lastOrderId: id }),
  setPendingBookingId: (id) => set({ pendingBookingId: id }),
  clearCheckoutSession: () => set({ draft: null, pendingBookingId: null }),
}));
