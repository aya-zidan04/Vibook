package com.vibook.backend.dto;

import com.vibook.backend.entity.UserReportStatus;
import java.time.Instant;

public record UserReportCreatedResponse(Long id, UserReportStatus status, Instant createdAt) {
}
