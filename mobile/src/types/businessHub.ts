import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';

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

export type BusinessEventRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  governorateSlug: JordanGovernorateSlug;
  /** Google Maps place or share link. */
  mapsUrl: string;
  price: string;
  capacity: string;
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
