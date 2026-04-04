import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  ApplicationStatus,
  BusinessBookingRecord,
  BusinessBookingStatus,
  BusinessEventRecord,
  BusinessListing,
  BusinessProfile,
  PartnerApplicationPayload,
} from '@/types/businessHub';
import { migrateBusinessEventRecord } from '@/utils/migrateBusinessEventRecord';
import { migrateBusinessProfile } from '@/utils/migrateBusinessProfile';

function emptyProfile(): BusinessProfile {
  return {
    displayName: '',
    tagline: '',
    description: '',
    category: '',
    email: '',
    phone: '',
    governorateSlug: 'amman',
    mapsUrl: '',
    website: '',
    coverImageUri: '',
    logoUri: '',
  };
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type State = {
  applicationStatus: ApplicationStatus;
  rejectedReason: string;
  profile: BusinessProfile;
  listings: BusinessListing[];
  events: BusinessEventRecord[];
  bookings: BusinessBookingRecord[];

  setApplicationStatus: (s: ApplicationStatus) => void;
  devSetRejected: (reason: string) => void;
  submitApplication: (p: PartnerApplicationPayload) => void;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  resetHub: () => void;

  addListing: (l: Omit<BusinessListing, 'id'>) => string;
  updateListing: (id: string, patch: Partial<BusinessListing>) => void;
  removeListing: (id: string) => void;

  addEvent: (e: Omit<BusinessEventRecord, 'id'>) => string;
  updateEvent: (id: string, patch: Partial<BusinessEventRecord>) => void;
  removeEvent: (id: string) => void;

  addBooking: (b: Omit<BusinessBookingRecord, 'id' | 'createdAt'>) => void;
  cycleBookingStatus: (id: string) => void;
};

const initialBookings: BusinessBookingRecord[] = [
  {
    id: 'demo-1',
    guestEmail: 'guest@example.com',
    partySize: 2,
    status: 'pending',
    listingTitle: 'Demo listing',
    createdAt: new Date().toISOString(),
  },
];

export const useBusinessHubStore = create<State>()(
  persist(
    (set) => ({
      applicationStatus: 'none',
      rejectedReason: '',
      profile: emptyProfile(),
      listings: [],
      events: [],
      bookings: [...initialBookings],

      setApplicationStatus: (applicationStatus) => set({ applicationStatus }),

      devSetRejected: (rejectedReason) =>
        set({ applicationStatus: 'rejected', rejectedReason }),

      submitApplication: (p) =>
        set((s) => ({
          applicationStatus: 'pending',
          rejectedReason: '',
          profile: {
            ...s.profile,
            displayName: p.companyName,
            email: p.email,
            phone: p.phone,
            category: p.category,
            description: p.message || s.profile.description,
          },
        })),

      updateProfile: (patch) =>
        set((s) => ({
          profile: { ...s.profile, ...patch },
        })),

      resetHub: () =>
        set({
          applicationStatus: 'none',
          rejectedReason: '',
          profile: emptyProfile(),
          listings: [],
          events: [],
          bookings: [...initialBookings],
        }),

      addListing: (l) => {
        const id = newId('listing');
        set((s) => ({ listings: [...s.listings, { ...l, id }] }));
        return id;
      },

      updateListing: (id, patch) =>
        set((s) => ({
          listings: s.listings.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      removeListing: (id) =>
        set((s) => ({
          listings: s.listings.filter((x) => x.id !== id),
        })),

      addEvent: (e) => {
        const id = newId('event');
        set((s) => ({ events: [...s.events, { ...e, id }] }));
        return id;
      },

      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      removeEvent: (id) =>
        set((s) => ({
          events: s.events.filter((x) => x.id !== id),
        })),

      addBooking: (b) =>
        set((s) => ({
          bookings: [
            ...s.bookings,
            {
              ...b,
              id: newId('booking'),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      cycleBookingStatus: (id) => {
        const order: BusinessBookingStatus[] = ['pending', 'confirmed', 'cancelled'];
        set((s) => ({
          bookings: s.bookings.map((b) => {
            if (b.id !== id) return b;
            const i = order.indexOf(b.status);
            const next = order[(i + 1) % order.length];
            return { ...b, status: next };
          }),
        }));
      },
    }),
    {
      name: 'vibook-business-hub',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        applicationStatus: s.applicationStatus,
        rejectedReason: s.rejectedReason,
        profile: s.profile,
        listings: s.listings,
        events: s.events,
        bookings: s.bookings,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const eventsRaw = p.events ?? current.events;
        const profileRaw = p.profile ?? current.profile;
        return {
          ...current,
          ...p,
          profile: migrateBusinessProfile(profileRaw),
          events: eventsRaw.map(migrateBusinessEventRecord),
        };
      },
    },
  ),
);
