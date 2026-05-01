package com.vibook.backend.dto;

import com.vibook.backend.entity.ModerationReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateModerationReportRequest(
    @NotNull ModerationReportType targetType,
    Long targetId,
    @NotBlank @Size(max = 500) String reason,
    @Size(max = 4000) String description
) {
}
