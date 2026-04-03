package com.vibook.service;

import com.vibook.entity.UserNotification;
import com.vibook.repository.UserNotificationRepository;
import com.vibook.web.dto.notification.NotificationResponse;
import com.vibook.web.dto.notification.NotificationsListResponse;
import com.vibook.web.dto.notification.PatchNotificationRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class NotificationService {

    private final UserNotificationRepository notificationRepository;

    public NotificationService(UserNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public NotificationsListResponse listNotifications(UUID userId) {
        var list = notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .toList();
        return new NotificationsListResponse(list);
    }

    @Transactional
    public NotificationResponse patchNotification(UUID userId, UUID notificationId, PatchNotificationRequest request) {
        UserNotification n = notificationRepository.findByIdAndUser_Id(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        n.setRead(request.read());
        return NotificationResponse.fromEntity(notificationRepository.save(n));
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadForUser(userId);
    }
}
