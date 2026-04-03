export type ApiFieldError = { field: string; message: string };

export type ApiErrorBody = {
  timestamp?: string;
  status: number;
  message: string;
  path?: string;
  fieldErrors?: ApiFieldError[];
};

export type UserResponseDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nameAr: string | null;
  phone: string;
  preferredLanguage: 'EN' | 'AR';
  avatarUrl: string | null;
  membershipTier: 'STANDARD' | 'GOLD' | 'PLATINUM';
  walletBalance: number;
  walletCurrency: string;
  cityId: number | null;
};

export type AuthResponseDto = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserResponseDto;
};

export type RatingResponseDto = {
  vertical: string;
  refId: number;
  stars: number;
  updatedAt: string;
};

export type RatingsListResponseDto = {
  ratings: RatingResponseDto[];
};

export type FavoriteResponseDto = {
  type: string;
  refId: number;
  createdAt: string;
};

export type FavoritesListResponseDto = {
  favorites: FavoriteResponseDto[];
};

export type PageResponseDto<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CreateBookingRequestDto = {
  type: string;
  refId: number;
  refTitle: string;
  refTitleAr?: string | null;
  imageUrl: string;
  startsAt: string;
  cityName: string;
  cityNameAr?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  fees?: number | null;
  totalPaid?: number | null;
  currency: 'JOD' | 'USD';
  paymentReference?: string | null;
};

export type BookingResponseDto = {
  id: string;
  userId: string;
  type: string;
  refId: number;
  refTitle: string;
  refTitleAr: string | null;
  imageUrl: string;
  status: string;
  startsAt: string;
  cityName: string;
  cityNameAr: string | null;
  totalPaid: number | string;
  currency: string;
  quantity: number;
  unitPrice: number | string | null;
  fees: number | string | null;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingListResponseDto = {
  bookings: BookingResponseDto[];
};

export type WalletResponseDto = {
  balance: number | string;
  currency: string;
};

export type VoucherResponseDto = {
  id: string;
  code: string;
  title: string;
  titleAr: string | null;
  discountType: string;
  discountValue: number | string;
  expiresAt: string;
  redeemed: boolean;
};

export type VouchersListResponseDto = {
  vouchers: VoucherResponseDto[];
};

export type RedeemVoucherRequestDto = {
  code: string;
};

export type MembershipPlanResponseDto = {
  id: number;
  code: string;
  tier: 'STANDARD' | 'GOLD' | 'PLATINUM';
  nameEn: string;
  nameAr: string | null;
  priceMonthly: number | string;
  currency: string;
  recommended: boolean;
  benefits: string[];
};

export type MembershipPlansListResponseDto = {
  plans: MembershipPlanResponseDto[];
};

export type MeMembershipResponseDto = {
  membershipTier: 'STANDARD' | 'GOLD' | 'PLATINUM';
  subscriptionStatus: 'NONE' | 'ACTIVE' | 'CANCELLED';
  planId: number | null;
  planCode: string | null;
  planNameEn: string | null;
  planNameAr: string | null;
  planPriceMonthly: number | string | null;
  planCurrency: string | null;
  planRecommended: boolean | null;
  planBenefits: string[] | null;
  subscribedAt: string | null;
  renewsAt: string | null;
  paymentReference: string | null;
};

export type SubscribeMembershipRequestDto = {
  planId: number;
  paymentReference?: string | null;
};

export type NotificationResponseDto = {
  id: string;
  kind: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  payload?: Record<string, unknown> | null;
};

export type NotificationsListResponseDto = {
  notifications: NotificationResponseDto[];
};

export type PatchNotificationRequestDto = {
  read: boolean;
};

export type CreateBusinessLeadRequestDto = {
  companyName: string;
  email: string;
  phone: string;
  category: string;
  message: string;
};

export type BusinessLeadResponseDto = {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
