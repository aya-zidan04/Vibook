package com.vibook.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record AdminEventRowResponse(
    Long id,
    String title,
    Long businessProfileId,
    String businessName,
    String categoryName,
    String governorateName,
    LocalDate eventDate,
    BigDecimal priceJod,
    String currency,
    int capacityGuests,
    int photoCount,
    /** VISIBLE or HIDDEN (no separate approval workflow). */
    String visibilityStatus,
    Instant createdAt
) {
}
