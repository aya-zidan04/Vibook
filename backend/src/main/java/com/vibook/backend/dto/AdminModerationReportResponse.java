package com.vibook.backend.dto;

import com.vibook.backend.entity.ModerationReportStatus;
import com.vibook.backend.entity.ModerationReportType;
import java.time.Instant;

public record AdminModerationReportResponse(
    Long id,
    Long reporterUserId,
    String reporterEmail,
    ModerationReportType type,
    Long targetId,
    String reason,
    String description,
    ModerationReportStatus status,
    String adminNotes,
    Instant createdAt,
    Instant updatedAt,
    Instant resolvedAt
) {
}
