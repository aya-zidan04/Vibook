export type BusinessProfileStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export type RoleName = 'ROLE_USER' | 'ROLE_BUSINESS' | 'ROLE_ADMIN';

export type UserResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  roles: RoleName[];
};

export type AuthResponse = {
  token: string;
  tokenType: string;
  refreshToken: string;
  user: UserResponse;
};

export type BusinessProfileResponse = {
  id: number;
  businessName: string;
  tagline: string | null;
  bannerImageUrl: string | null;
  logoImageUrl: string | null;
  primaryCategoryId: number | null;
  primaryCategoryName: string | null;
  description: string | null;
  workEmail: string | null;
  phone: string | null;
  governorateId: number | null;
  governorateName: string | null;
  googleMapsUrl: string | null;
  website: string | null;
  status: BusinessProfileStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason: string | null;
  ownerEmail: string | null;
  ownerUserId?: number | null;
  adminNotes?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
};

export type TimeSeriesPointResponse = {
  date: string;
  count: number;
};

export type NameCountResponse = {
  name: string;
  count: number;
};

export type AdminAnalyticsSummaryResponse = {
  totalUsers: number;
  activeUsers: number;
  totalBusinessProfiles: number;
  pendingBusinessProfiles: number;
  approvedBusinessProfiles: number;
  rejectedBusinessProfiles: number;
  draftBusinessProfiles: number;
  approvalRatePercent: number;
  rejectionRatePercent: number;
  newUsersByDay: TimeSeriesPointResponse[];
  newBusinessProfilesByDay: TimeSeriesPointResponse[];
  newBookingsByDay: TimeSeriesPointResponse[];
  businessProfilesByStatus: NameCountResponse[];
  topCategories: NameCountResponse[];
  topGovernorates: NameCountResponse[];
  bookingsTrendAvailable: boolean;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type CategoryResponse = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
};

export type CategoryAdminResponse = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
  usageCount: number;
};

export type GovernorateResponse = {
  id: number;
  name: string;
  displayOrder: number;
  active: boolean;
};

export type GovernorateAdminStatsResponse = {
  id: number;
  name: string;
  displayOrder: number;
  active: boolean;
  businessCount: number;
};

/** Event list row from admin moderation API. */
export type AdminEventRowResponse = {
  id: number;
  title: string | null;
  businessProfileId: number;
  businessName: string | null;
  categoryName: string | null;
  governorateName: string | null;
  priceJod: number;
  currency: string;
  capacityGuests: number;
  visibilityStatus: 'VISIBLE' | 'HIDDEN' | string;
  createdAt: string;
};

/** Full event payload (consumer shape) returned inside admin detail. */
export type BusinessEventResponse = {
  id: number;
  businessProfileId: number;
  title: string | null;
  subcategoryId: number | null;
  subcategoryName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  description: string | null;
  eventDate: string;
  timeSlots: string[];
  governorateId: number | null;
  governorateName: string | null;
  googleMapsUrl: string | null;
  priceJod: number;
  currency: string;
  capacityGuests: number;
  hidden: boolean;
  averageRating: number;
  reviewCount: number;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  myRating: number | null;
  myRatingId: number | null;
  canRate: boolean | null;
};

export type AdminEventDetailPayload = {
  event: BusinessEventResponse;
  adminNotes: string | null;
};

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type PaymentProvider = 'PAYPAL';

export type PaymentStatus = 'CREATED' | 'APPROVED' | 'CAPTURED' | 'FAILED' | 'CANCELLED';

export type AdminBookingPaymentInfo = {
  paymentId: number;
  provider: PaymentProvider;
  paymentStatus: PaymentStatus;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  amount: number;
  currency: string;
  confirmedByPayPalCapture: boolean;
};

export type AdminBookingResponse = {
  id: number;
  eventId: number;
  eventTitle: string | null;
  businessProfileId: number;
  businessName: string | null;
  userId: number;
  userEmail: string;
  status: BookingStatus;
  eventDate: string;
  timeSlotId: number | null;
  timeSlotLabel: string | null;
  guestsCount: number;
  totalPriceJod: number;
  note: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  payment: AdminBookingPaymentInfo | null;
};

export type AdminEventRatingResponse = {
  id: number;
  userId: number;
  userEmail: string;
  eventId: number;
  eventTitle: string | null;
  businessProfileId: number;
  businessName: string | null;
  ratingValue: number;
  moderationHidden: boolean;
  flagged: boolean;
  createdAt: string;
};

export type ModerationReportType =
  | 'BOOKING'
  | 'EVENT'
  | 'USER'
  | 'RATING'
  | 'BUSINESS_PROFILE'
  | 'OTHER';

export type ModerationReportStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export type AdminModerationReportResponse = {
  id: number;
  reporterUserId: number;
  reporterEmail: string;
  type: ModerationReportType;
  targetId: number | null;
  reason: string;
  description: string | null;
  status: ModerationReportStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type UserReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type AdminUserReportResponse = {
  id: number;
  userId: number;
  userEmail: string;
  subject: string;
  message: string;
  status: UserReportStatus;
  createdAt: string;
  updatedAt: string;
};
