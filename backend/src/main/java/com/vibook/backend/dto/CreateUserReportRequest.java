package com.vibook.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserReportRequest(
    @NotBlank @Size(max = 200) String subject,
    @NotBlank @Size(max = 4000) String message
) {
}
