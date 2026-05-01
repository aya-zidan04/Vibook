package com.vibook.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingCreateRequest(
    @NotNull(message = "Event id is required")
    Long eventId,

    Long timeSlotId,

    @NotNull(message = "Guests count is required")
    @Min(value = 1, message = "Guests count must be at least 1")
    @Max(value = 500, message = "Guests count is too large")
    Integer guestsCount,

    @Size(max = 500, message = "Note must not exceed 500 characters")
    String note
) {
}
