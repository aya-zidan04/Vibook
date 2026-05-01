import { api } from '@/api/client';
import type {
  AdminActivityLogResponse,
  AdminAnalyticsSummaryResponse,
  AdminBookingResponse,
  AdminDashboardStatsResponse,
  AdminEventDetailPayload,
  AdminEventRatingResponse,
  AdminEventRowResponse,
  AdminModerationReportResponse,
  AuthResponse,
  BookingStatus,
  BusinessEventResponse,
  BusinessProfileResponse,
  BusinessProfileStatus,
  CategoryAdminResponse,
  CategoryResponse,
  GovernorateAdminStatsResponse,
  GovernorateResponse,
  RoleName,
  SpringPage,
  UserResponse,
} from '@/api/types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function fetchDashboardStats(): Promise<AdminDashboardStatsResponse> {
  const { data } = await api.get<AdminDashboardStatsResponse>('/admin/dashboard/stats');
  return data;
}

export async function fetchAnalyticsSummary(): Promise<AdminAnalyticsSummaryResponse> {
  const { data } = await api.get<AdminAnalyticsSummaryResponse>('/admin/analytics/summary');
  return data;
}

export async function fetchActivityLog(params?: {
  page?: number;
  size?: number;
  entityType?: string;
  entityId?: number;
}): Promise<SpringPage<AdminActivityLogResponse>> {
  const { data } = await api.get<SpringPage<AdminActivityLogResponse>>('/admin/activity-log', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 30,
      entityType: params?.entityType,
      entityId: params?.entityId,
    },
  });
  return data;
}

export type BusinessProfileQuery = {
  status?: BusinessProfileStatus | 'ALL';
  categoryId?: number;
  governorateId?: number;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export async function fetchBusinessProfilesPage(
  query: BusinessProfileQuery = {},
): Promise<SpringPage<BusinessProfileResponse>> {
  const {
    status,
    categoryId,
    governorateId,
    createdFrom,
    createdTo,
    page = 0,
    size = 50,
    sort = 'createdAt,desc',
  } = query;
  const params: Record<string, string | number> = { page, size, sort };
  if (status && status !== 'ALL') params.status = status;
  if (categoryId != null) params.categoryId = categoryId;
  if (governorateId != null) params.governorateId = governorateId;
  if (createdFrom) params.createdFrom = createdFrom;
  if (createdTo) params.createdTo = createdTo;
  const { data } = await api.get<SpringPage<BusinessProfileResponse>>('/admin/business-profiles', { params });
  return data;
}

export async function fetchBusinessProfile(id: number): Promise<BusinessProfileResponse> {
  const { data } = await api.get<BusinessProfileResponse>(`/admin/business-profiles/${id}`);
  return data;
}

export async function approveBusinessProfile(id: number): Promise<BusinessProfileResponse> {
  const { data } = await api.patch<BusinessProfileResponse>(`/admin/business-profiles/${id}/approve`);
  return data;
}

export async function rejectBusinessProfile(
  id: number,
  reason?: string | null,
): Promise<BusinessProfileResponse> {
  const { data } = await api.patch<BusinessProfileResponse>(
    `/admin/business-profiles/${id}/reject`,
    reason ? { reason } : {},
  );
  return data;
}

export async function bulkApproveBusinessProfiles(ids: number[]): Promise<BusinessProfileResponse[]> {
  const { data } = await api.post<BusinessProfileResponse[]>('/admin/business-profiles/bulk-approve', { ids });
  return data;
}

export async function bulkRejectBusinessProfiles(
  ids: number[],
  reason?: string | null,
): Promise<BusinessProfileResponse[]> {
  const { data } = await api.post<BusinessProfileResponse[]>('/admin/business-profiles/bulk-reject', {
    ids,
    reason: reason ?? undefined,
  });
  return data;
}

export async function updateBusinessProfileNotes(
  id: number,
  notes: string,
): Promise<BusinessProfileResponse> {
  const { data } = await api.patch<BusinessProfileResponse>(`/admin/business-profiles/${id}/notes`, { notes });
  return data;
}

export async function fetchAllUsers(): Promise<UserResponse[]> {
  const { data } = await api.get<UserResponse[]>('/users');
  return data;
}

export async function fetchUserById(id: number): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(`/users/${id}`);
  return data;
}

export async function updateUserRoles(userId: number, roles: RoleName[]): Promise<UserResponse> {
  const { data } = await api.patch<UserResponse>(`/admin/users/${userId}/roles`, { roles });
  return data;
}

export async function enableUserAccount(userId: number): Promise<UserResponse> {
  const { data } = await api.patch<UserResponse>(`/admin/users/${userId}/enable`);
  return data;
}

export async function disableUserAccount(userId: number): Promise<void> {
  await api.patch(`/admin/users/${userId}/disable`);
}

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const { data } = await api.get<CategoryResponse[]>('/categories');
  return data;
}

export async function fetchAdminCategories(): Promise<CategoryAdminResponse[]> {
  const { data } = await api.get<CategoryAdminResponse[]>('/admin/categories');
  return data;
}

export async function createAdminCategory(body: {
  name: string;
  slug: string;
  icon?: string;
  active: boolean;
}): Promise<CategoryAdminResponse> {
  const { data } = await api.post<CategoryAdminResponse>('/admin/categories', body);
  return data;
}

export async function updateAdminCategory(
  id: number,
  body: { name: string; slug: string; icon?: string; active: boolean },
): Promise<CategoryAdminResponse> {
  const { data } = await api.put<CategoryAdminResponse>(`/admin/categories/${id}`, body);
  return data;
}

export async function deleteAdminCategory(id: number): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
}

export async function fetchGovernoratesActive(): Promise<GovernorateResponse[]> {
  const { data } = await api.get<GovernorateResponse[]>('/governorates/active');
  return data;
}

export async function fetchAllGovernorates(): Promise<GovernorateResponse[]> {
  const { data } = await api.get<GovernorateResponse[]>('/governorates');
  return data;
}

export async function fetchGovernorateStats(): Promise<GovernorateAdminStatsResponse[]> {
  const { data } = await api.get<GovernorateAdminStatsResponse[]>('/admin/governorates/stats');
  return data;
}

export async function updateGovernorate(
  id: number,
  body: { name: string; displayOrder: number; active: boolean },
): Promise<GovernorateResponse> {
  const { data } = await api.put<GovernorateResponse>(`/governorates/${id}`, body);
  return data;
}

/* —— Events moderation —— */

export type AdminEventQuery = {
  categoryId?: number;
  governorateId?: number;
  visibility?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export async function fetchAdminEventsPage(query: AdminEventQuery = {}): Promise<SpringPage<AdminEventRowResponse>> {
  const { categoryId, governorateId, visibility, search, page = 0, size = 20, sort = 'createdAt,desc' } = query;
  const params: Record<string, string | number> = { page, size, sort };
  if (categoryId != null) params.categoryId = categoryId;
  if (governorateId != null) params.governorateId = governorateId;
  if (visibility && visibility !== 'ALL') params.visibility = visibility;
  if (search) params.search = search;
  const { data } = await api.get<SpringPage<AdminEventRowResponse>>('/admin/events', { params });
  return data;
}

export async function fetchAdminEventDetail(id: number): Promise<AdminEventDetailPayload> {
  const { data } = await api.get<AdminEventDetailPayload>(`/admin/events/${id}`);
  return data;
}

export async function hideAdminEvent(id: number): Promise<BusinessEventResponse> {
  const { data } = await api.patch<BusinessEventResponse>(`/admin/events/${id}/hide`);
  return data;
}

export async function showAdminEvent(id: number): Promise<BusinessEventResponse> {
  const { data } = await api.patch<BusinessEventResponse>(`/admin/events/${id}/show`);
  return data;
}

export async function deleteAdminEvent(id: number): Promise<void> {
  await api.delete(`/admin/events/${id}`);
}

export async function updateAdminEventNotes(id: number, notes: string): Promise<void> {
  await api.patch(`/admin/events/${id}/notes`, { notes });
}

/* —— Bookings moderation —— */

export type AdminBookingQuery = {
  status?: BookingStatus;
  businessProfileId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export async function fetchAdminBookingsPage(query: AdminBookingQuery = {}): Promise<SpringPage<AdminBookingResponse>> {
  const {
    status,
    businessProfileId,
    dateFrom,
    dateTo,
    search,
    page = 0,
    size = 20,
    sort = 'createdAt,desc',
  } = query;
  const params: Record<string, string | number> = { page, size, sort };
  if (status) params.status = status;
  if (businessProfileId != null) params.businessProfileId = businessProfileId;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  if (search) params.search = search;
  const { data } = await api.get<SpringPage<AdminBookingResponse>>('/admin/bookings', { params });
  return data;
}

export async function fetchAdminBooking(id: number): Promise<AdminBookingResponse> {
  const { data } = await api.get<AdminBookingResponse>(`/admin/bookings/${id}`);
  return data;
}

export async function cancelAdminBooking(id: number, reason?: string | null): Promise<AdminBookingResponse> {
  const { data } = await api.patch<AdminBookingResponse>(`/admin/bookings/${id}/cancel`, {
    reason: reason ?? undefined,
  });
  return data;
}

export async function completeAdminBooking(id: number): Promise<AdminBookingResponse> {
  const { data } = await api.patch<AdminBookingResponse>(`/admin/bookings/${id}/complete`);
  return data;
}

/* —— Ratings moderation —— */

export type AdminRatingQuery = {
  minRating?: number;
  flaggedOnly?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export async function fetchAdminRatingsPage(query: AdminRatingQuery = {}): Promise<SpringPage<AdminEventRatingResponse>> {
  const { minRating, flaggedOnly, search, page = 0, size = 25, sort = 'createdAt,desc' } = query;
  const params: Record<string, string | number | boolean> = { page, size, sort };
  if (minRating != null) params.minRating = minRating;
  if (flaggedOnly === true) params.flaggedOnly = true;
  if (search) params.search = search;
  const { data } = await api.get<SpringPage<AdminEventRatingResponse>>('/admin/ratings', { params });
  return data;
}

export async function deleteAdminRating(id: number): Promise<void> {
  await api.delete(`/admin/ratings/${id}`);
}

export async function setAdminRatingHidden(id: number, hidden: boolean): Promise<AdminEventRatingResponse> {
  const { data } = await api.patch<AdminEventRatingResponse>(`/admin/ratings/${id}/hide`, { hidden });
  return data;
}

/* —— Reports —— */

export async function fetchAdminReportsPage(params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<SpringPage<AdminModerationReportResponse>> {
  const { data } = await api.get<SpringPage<AdminModerationReportResponse>>('/admin/reports', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sort: params?.sort ?? 'createdAt,desc',
    },
  });
  return data;
}

export async function fetchAdminReport(id: number): Promise<AdminModerationReportResponse> {
  const { data } = await api.get<AdminModerationReportResponse>(`/admin/reports/${id}`);
  return data;
}

export async function reviewAdminReport(id: number, adminNotes?: string | null): Promise<AdminModerationReportResponse> {
  const { data } = await api.patch<AdminModerationReportResponse>(`/admin/reports/${id}/review`, {
    adminNotes: adminNotes ?? undefined,
  });
  return data;
}

export async function resolveAdminReport(id: number, adminNotes?: string | null): Promise<AdminModerationReportResponse> {
  const { data } = await api.patch<AdminModerationReportResponse>(`/admin/reports/${id}/resolve`, {
    adminNotes: adminNotes ?? undefined,
  });
  return data;
}

export async function dismissAdminReport(id: number, adminNotes?: string | null): Promise<AdminModerationReportResponse> {
  const { data } = await api.patch<AdminModerationReportResponse>(`/admin/reports/${id}/dismiss`, {
    adminNotes: adminNotes ?? undefined,
  });
  return data;
}
