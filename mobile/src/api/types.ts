/** Mirrors backend DTO field names (camelCase JSON). */

export type RoleName = 'ROLE_USER' | 'ROLE_BUSINESS' | 'ROLE_ADMIN';

export type UserResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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

export type TokenRefreshResponse = {
  token: string;
  tokenType: string;
};

export type MessageResponse = {
  message: string;
};

export type ErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string> | null;
};

export type CategoryResponse = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
};

export type SubcategoryResponse = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  active: boolean;
};

export type GovernorateResponse = {
  id: number;
  /** English canonical name from database. */
  name: string;
  displayOrder: number;
  active: boolean;
};

export type BusinessEventSummaryResponse = {
  id: number;
  title: string;
  eventDate: string;
  hidden: boolean;
  priceJod: string;
  currency: string;
  capacityGuests: number;
  governorateId: number | null;
  governorateName: string;
  subcategoryId: number | null;
  subcategoryName: string;
  categoryId: number | null;
  categoryName: string;
  businessName: string;
  timeSlots: string[];
  description: string;
  primaryPhotoUrl: string | null;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
};

export type BusinessEventPhotoDto = {
  id: number;
  url: string;
  sortOrder: number;
};

export type BusinessEventResponse = {
  id: number;
  businessProfileId: number;
  businessName: string;
  title: string;
  subcategoryId: number;
  subcategoryName: string;
  categoryId: number;
  categoryName: string;
  description: string;
  eventDate: string;
  timeSlots: string[];
  governorateId: number;
  governorateName: string;
  googleMapsUrl: string | null;
  priceJod: string;
  currency: string;
  capacityGuests: number;
  remainingCapacity: number;
  hidden: boolean;
  averageRating: number;
  reviewCount: number;
  photoUrls: string[];
  photos?: BusinessEventPhotoDto[];
  createdAt: string;
  updatedAt: string;
  myRating: number | null;
  /** Present when the viewer has saved a rating row on the server. */
  myRatingId?: number | null;
  canRate: boolean | null;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type BookingStatusApi = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type BookingResponse = {
  id: number;
  eventId: number;
  eventTitle: string;
  eventPrimaryPhotoUrl: string | null;
  eventPhotoUrls: string[];
  userId: number;
  userEmail: string;
  userFirstName: string | null;
  userLastName: string | null;
  userFullName: string | null;
  userPhone: string | null;
  status: BookingStatusApi;
  eventDate: string;
  timeSlotId: number | null;
  timeSlotLabel: string | null;
  guestsCount: number;
  totalPriceJod: string;
  currency: string;
  note: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FavoriteEventResponse = {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  timeSlots: string[];
  governorateName: string;
  subcategoryName: string;
  categoryName: string;
  businessName: string;
  priceJod: string;
  currency: string;
  coverPhotoUrl: string | null;
  averageRating: number;
  reviewCount: number;
  hidden: boolean;
  favorited: boolean;
  favoriteCreatedAt: string;
};

export type FavoriteResponse = {
  id: number;
  eventId: number;
  eventTitle: string;
  createdAt: string;
};

export type FavoriteStatusResponse = {
  eventId: number;
  favorited: boolean;
};

export type PaymentMethodResponse = {
  id: number;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardHolderName: string;
  isDefault: boolean;
};

export type EventRatingResponse = {
  eventId: number;
  averageRating: number;
  reviewCount: number;
  myRating: number | null;
  myRatingId?: number | null;
  canRate: boolean;
};

export type ModerationReportType =
  | 'BOOKING'
  | 'EVENT'
  | 'USER'
  | 'RATING'
  | 'BUSINESS_PROFILE'
  | 'OTHER';

export type ModerationReportCreatedResponse = {
  id: number;
  targetType: ModerationReportType;
  targetId: number | null;
  status: string;
  createdAt: string;
};

export type UserReportCreatedResponse = {
  id: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
};

/** Mirrors {@code BusinessProfileStatus} on the backend. */
export type BusinessProfileStatusDto = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

/** Mirrors {@code BusinessProfileResponse} JSON from {@code GET|PUT|PATCH} {@code /business-profile/me}. */
export type BusinessProfileResponseDto = {
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
  status: BusinessProfileStatusDto;
  createdAt: string;
  updatedAt: string;
  rejectionReason: string | null;
  ownerEmail: string | null;
  ownerUserId?: number | null;
  adminNotes?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  requiresReApproval?: boolean;
  previouslyApproved?: boolean;
};

/** @deprecated Use {@link BusinessProfileResponseDto}; kept for narrow imports. */
export type BusinessProfileMeResponse = Pick<
  BusinessProfileResponseDto,
  'id' | 'businessName' | 'status' | 'rejectionReason'
>;

export type BusinessProfileUpsertPayload = {
  businessName: string;
  tagline?: string | null;
  primaryCategoryId: number;
  description: string;
  workEmail: string;
  phone: string;
  governorateId: number;
  googleMapsUrl?: string | null;
  website?: string | null;
};
