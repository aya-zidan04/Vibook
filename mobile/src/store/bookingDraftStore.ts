import { create } from 'zustand';

export type BookingDraft = {
  vertical: 'event' | 'restaurant' | 'stay' | 'flight' | 'experience' | 'package';
  refId: string;
  title: string;
  imageUrl: string;
  currency: string;
  unitPrice: number;
  quantity: number;
  fees: number;
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
