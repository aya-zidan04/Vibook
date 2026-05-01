package com.vibook.backend.dto;

import com.vibook.backend.entity.AdminActivityAction;
import java.time.Instant;

public record AdminActivityLogResponse(
    Long id,
    Long adminUserId,
    String adminEmail,
    AdminActivityAction action,
    String entityType,
    Long entityId,
    String details,
    Instant createdAt
) {
}
