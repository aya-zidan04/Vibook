package com.vibook.backend.dto;

import jakarta.validation.constraints.Size;

public record CancelBookingRequest(
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    String reason
) {
}
