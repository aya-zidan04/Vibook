package com.vibook.backend.dto;

import com.vibook.backend.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record BookingStatusUpdateRequest(
    @NotNull(message = "Status is required")
    BookingStatus status
) {
}
