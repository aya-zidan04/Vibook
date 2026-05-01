package com.vibook.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminEventRowResponse(
    Long id,
    String title,
    Long businessProfileId,
    String businessName,
    String categoryName,
    String governorateName,
    BigDecimal priceJod,
    String currency,
    int capacityGuests,
    /** VISIBLE or HIDDEN (DRAFT is reserved for a future lifecycle state). */
    String visibilityStatus,
    Instant createdAt
) {
}
