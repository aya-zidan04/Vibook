package com.vibook.backend.dto;

import com.vibook.backend.entity.UserReportStatus;
import jakarta.validation.constraints.NotNull;

public record AdminUserReportStatusRequest(@NotNull UserReportStatus status) {
}
