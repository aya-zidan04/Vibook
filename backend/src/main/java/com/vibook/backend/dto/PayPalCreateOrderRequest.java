package com.vibook.backend.dto;

import jakarta.validation.constraints.NotNull;

public record PayPalCreateOrderRequest(
    @NotNull(message = "Booking id is required")
    Long bookingId,

    @NotNull(message = "Event id is required")
    Long eventId,

    Long timeSlotId
) {}
