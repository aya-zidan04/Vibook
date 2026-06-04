export type ID = string;

export type BadgeTone = 'popular' | 'limited' | 'new' | 'soldFast' | 'exclusive';

export type User = {
  id: ID;
  name: string;
  /** Arabic display name for profile when locale is `ar`. */
  nameAr?: string;
  email: string;
  phone: string;
  /** Null when the user has no profile photo (optional). */
  avatarUrl: string | null;
  cityId: ID;
  /** True when the user has an active Premium membership (billing not connected in this build). */
  isPremiumMember: boolean;
  walletBalance: number;
  preferredLanguage: 'en' | 'ar';
};

export type City = {
  id: ID;
  nameEn: string;
  nameAr: string;
  country: string;
  /** Canonical slug when known (e.g. `amman`). */
  slug?: string;
  displayOrder?: number;
  active?: boolean;
  imageUrl?: string;
};

export type Category = {
  id: ID;
  slug: string;
  labelEn: string;
  labelAr: string;
  icon: string;
};

export type Organizer = {
  id: ID;
  name: string;
  logoUrl: string;
  coverUrl: string;
  verified: boolean;
  about: string;
  rating: number;
  reviewCount: number;
};

export type TicketTier = {
  id: ID;
  eventId: ID;
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  /** Optional subtitle line (e.g. from business ticket description). */
  description?: string;
  remaining?: number;
};

export type EventItem = {
  id: ID;
  title: string;
  categoryId: ID;
  cityId: ID;
  organizerId: ID;
  imageUrl: string;
  gallery: string[];
  startAt: string;
  endAt: string;
  venueName: string;
  address: string;
  description: string;
  priceFrom: number;
  currency: string;
  rating: number;
  reviewCount: number;
  badge?: BadgeTone;
};

export type ExperienceItem = {
  id: ID;
  title: string;
  categoryId: ID;
  cityId: ID;
  imageUrl: string;
  durationHours: number;
  priceFrom: number;
  currency: string;
  rating: number;
  badge?: BadgeTone;
};

export type Restaurant = {
  id: ID;
  name: string;
  cuisineIds: ID[];
  cityId: ID;
  imageUrl: string;
  priceLevel: 1 | 2 | 3 | 4;
  rating: number;
  reviewCount: number;
  badge?: BadgeTone;
};

export type Hotel = {
  id: ID;
  name: string;
  cityId: ID;
  imageUrl: string;
  stars: number;
  priceFrom: number;
  currency: string;
  rating: number;
  badge?: BadgeTone;
};

export type TravelPackage = {
  id: ID;
  title: string;
  cityIds: ID[];
  imageUrl: string;
  nights: number;
  priceFrom: number;
  currency: string;
  badge?: BadgeTone;
};

export type Offer = {
  id: ID;
  title: string;
  subtitle: string;
  imageUrl: string;
  discountPercent?: number;
  endsAt: string;
};

export type BookingStatus =
  | 'upcoming'
  | 'past'
  | 'cancelled'
  | 'pending_payment';

export type Booking = {
  id: ID;
  userId: ID;
  type: 'event' | 'restaurant' | 'hotel' | 'experience' | 'package';
  /** Target entity id for deep links. */
  refId?: ID;
  refTitle: string;
  refTitleAr?: string;
  imageUrl: string;
  status: BookingStatus;
  startsAt: string;
  cityName: string;
  cityNameAr?: string;
  totalPaid: number;
  currency: string;
};

export type Voucher = {
  id: ID;
  code: string;
  title: string;
  titleAr?: string;
  discountValue: number;
  discountType: 'percent' | 'fixed';
  expiresAt: string;
  redeemed: boolean;
};

export type Review = {
  id: ID;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
};
