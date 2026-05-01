package com.vibook.backend.dto;

import com.vibook.backend.entity.ModerationReportStatus;
import com.vibook.backend.entity.ModerationReportType;
import java.time.Instant;

public record ModerationReportCreatedResponse(
    Long id,
    ModerationReportType targetType,
    Long targetId,
    ModerationReportStatus status,
    Instant createdAt
) {
}
