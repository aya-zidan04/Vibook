package com.vibook.backend.dto;

import com.vibook.backend.entity.UserReportStatus;
import java.time.Instant;

public record AdminUserReportResponse(
    Long id,
    Long userId,
    String userEmail,
    String subject,
    String message,
    UserReportStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
