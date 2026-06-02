package com.vibook.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PayPalCaptureOrderRequest(
    @NotBlank(message = "PayPal order id is required")
    String paypalOrderId,

    @NotNull(message = "Booking id is required")
    Long bookingId
) {}
