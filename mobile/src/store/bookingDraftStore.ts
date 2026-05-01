import { create } from 'zustand';

export type BookingDraft = {
  vertical: 'event' | 'restaurant' | 'stay' | 'experience' | 'package';
  refId: string;
  /** When set, checkout calls `POST /api/v1/bookings` with this id. */
  apiEventId?: number;
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
  setDraft: (d: BookingDraft | null) => void;
  setLastOrderId: (id: string | null) => void;
};

export const useBookingDraftStore = create<State>((set) => ({
  draft: null,
  lastOrderId: null,
  setDraft: (d) => set({ draft: d }),
  setLastOrderId: (id) => set({ lastOrderId: id }),
}));
