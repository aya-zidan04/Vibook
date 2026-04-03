package com.vibook.web.dto.notification;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.vibook.entity.UserNotification;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record NotificationResponse(
        String id,
        String kind,
        String title,
        String body,
        Instant createdAt,
        boolean read,
        Map<String, Object> payload
) {
    public static NotificationResponse fromEntity(UserNotification n) {
        return new NotificationResponse(
                n.getId().toString(),
                n.getKind().getApiKey(),
                n.getTitle(),
                n.getBody(),
                n.getCreatedAt(),
                n.isRead(),
                n.getPayload()
        );
    }
}
