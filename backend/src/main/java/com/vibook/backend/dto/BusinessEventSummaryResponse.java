package com.vibook.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** Compact row for GET /api/v1/business/events list. */
public record BusinessEventSummaryResponse(
    Long id,
    String title,
    LocalDate eventDate,
    boolean hidden,
    BigDecimal priceJod,
    String currency,
    int capacityGuests,
    String governorateName,
    String subcategoryName,
    String primaryPhotoUrl,
    double averageRating,
    int reviewCount,
    Instant createdAt
) {
}
