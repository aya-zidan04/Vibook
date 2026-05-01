package com.vibook.backend.dto;

import jakarta.validation.constraints.Size;

public record AdminBookingCancelRequest(
    @Size(max = 500) String reason
) {
}
