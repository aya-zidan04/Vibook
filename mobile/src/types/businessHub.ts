import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';

/**
 * Business hub domain types used by the mobile app.
 *
 * Persistence today: Zustand `persist` → AsyncStorage (`vibook-business-hub`). No HTTP layer here.
 * When a backend exists, add mappers (e.g. `toBusinessEventRecord` / `fromBusinessEventRecord`) beside API
 * DTOs; keep screens and form state tied to these shapes rather than raw JSON.
 */

export type ApplicationStatus = 'none' | 'pending' | 'rejected' | 'approved';

export type BusinessProfile = {
  displayName: string;
  tagline: string;
  description: string;
  category: string;
  email: string;
  phone: string;
  governorateSlug: JordanGovernorateSlug;
  /** Google Maps place or share link. */
  mapsUrl: string;
  website: string;
  coverImageUri: string;
  logoUri: string;
};

export type BusinessListing = {
  id: string;
  title: string;
  category: string;
  description: string;
  coverUrl: string;
  visible: boolean;
};

/** One sellable ticket row for a business event (single or multi-tier). */
export type BusinessTicketOption = {
  id: string;
  name: string;
  /** Unit price in the ticket’s {@link BusinessTicketOption#currency} (typically JOD). */
  priceJod: number;
  currency: string;
  description?: string;
};

/** Client-side event row; maps cleanly to a future REST/JSON body (ISO date, numeric money, slug fields). */
export type BusinessEventRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  /** Event day in `YYYY-MM-DD` (local business intent; combine with `time` slots for full instants server-side). */
  date: string;
  /**
   * Multiple start times for the same `date`, persisted as comma-separated labels (matches {@link EVENT_TIME_OPTIONS}).
   * Backend can split into `string[]` or `LocalTime[]` without changing the editor’s UI model.
   */
  time: string;
  governorateSlug: JordanGovernorateSlug;
  /** Google Maps place or share link. */
  mapsUrl: string;
  /**
   * Ticket types for this event (one or many). Persisted with the hub; legacy storage with only `priceJod`
   * is upgraded in {@link migrateBusinessEventRecord}.
   */
  ticketOptions: BusinessTicketOption[];
  currency: string;
  /** Max guests / capacity for business use only (not shown on public PDP). */
  capacityGuests: number;
  images: string;
  listingId: string | null;
  hidden: boolean;
};

export type BusinessBookingStatus = 'pending' | 'confirmed' | 'cancelled';

export type BusinessBookingRecord = {
  id: string;
  guestEmail: string;
  partySize: number;
  status: BusinessBookingStatus;
  listingTitle: string;
  createdAt: string;
};

export type PartnerApplicationPayload = {
  companyName: string;
  email: string;
  phone: string;
  category: string;
  message: string;
};
