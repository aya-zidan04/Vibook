package com.vibook.web.dto.notification;

import java.util.List;

public record NotificationsListResponse(List<NotificationResponse> notifications) {
}
