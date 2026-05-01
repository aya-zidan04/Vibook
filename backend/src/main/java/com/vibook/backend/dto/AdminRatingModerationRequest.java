package com.vibook.backend.dto;

import jakarta.validation.constraints.NotNull;

public record AdminRatingModerationRequest(
    @NotNull Boolean hidden
) {
}
