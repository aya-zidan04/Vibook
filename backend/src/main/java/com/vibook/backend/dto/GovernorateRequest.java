package com.vibook.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GovernorateRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    String name,

    @NotNull(message = "Display order is required")
    Integer displayOrder,

    @NotNull(message = "Active flag is required")
    Boolean active
) {
}
