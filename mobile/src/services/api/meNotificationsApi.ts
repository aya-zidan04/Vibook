import type {
  NotificationResponseDto,
  NotificationsListResponseDto,
  PatchNotificationRequestDto,
} from '@/services/api/types';
import { apiRequest } from '@/services/api/http';

export const meNotificationsApi = {
  async list(): Promise<NotificationsListResponseDto> {
    return apiRequest<NotificationsListResponseDto>('/api/v1/me/notifications', { auth: true });
  },

  async patch(id: string, body: PatchNotificationRequestDto): Promise<NotificationResponseDto> {
    return apiRequest<NotificationResponseDto>(`/api/v1/me/notifications/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  },

  async readAll(): Promise<void> {
    await apiRequest<void>('/api/v1/me/notifications/read-all', {
      method: 'POST',
      auth: true,
    });
  },
};
