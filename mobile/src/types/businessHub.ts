import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import type { BookingStatusApi } from '@/api/types';

/**
 * Business hub domain types used by the mobile app.
 *
 * Hub profile/listings: Zustand `persist` → AsyncStorage. Partner **events** and **bookings** are loaded from
 * the API (`refreshBusinessHubLists`) and are not persisted in the hub store.
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
  /** Ticket types for this event (one or many). */
  ticketOptions: BusinessTicketOption[];
  currency: string;
  /** Max guests / capacity for business use only (not shown on public PDP). */
  capacityGuests: number;
  images: string;
  listingId: string | null;
  hidden: boolean;
  /** Set when loaded from `GET /business/events/{id}` — used if category resolution fails. */
  apiSubcategoryId?: number;
};

export type BusinessBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type BusinessBookingRecord = {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  partySize: number;
  status: BusinessBookingStatus;
  /** Raw API status for partner actions (advance PENDING → CONFIRMED → COMPLETED). */
  serverStatus?: BookingStatusApi;
  listingTitle: string;
  eventDate: string;
  timeSlotLabel: string | null;
  createdAt: string;
};

export type PartnerApplicationPayload = {
  companyName: string;
  email: string;
  phone: string;
  category: string;
  message: string;
};
