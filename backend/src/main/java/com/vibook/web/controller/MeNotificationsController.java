package com.vibook.web.controller;

import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.NotificationService;
import com.vibook.web.dto.notification.NotificationResponse;
import com.vibook.web.dto.notification.NotificationsListResponse;
import com.vibook.web.dto.notification.PatchNotificationRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/notifications")
public class MeNotificationsController {

    private final NotificationService notificationService;

    public MeNotificationsController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public NotificationsListResponse listNotifications(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        return notificationService.listNotifications(principal.getId());
    }

    @PatchMapping("/{id}")
    public NotificationResponse patchNotification(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody PatchNotificationRequest request
    ) {
        return notificationService.patchNotification(principal.getId(), id, request);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        notificationService.markAllRead(principal.getId());
    }
}
