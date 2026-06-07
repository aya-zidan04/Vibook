package com.vibook.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Compact row for consumer search and business event lists. */
public record BusinessEventSummaryResponse(
    Long id,
    String title,
    LocalDate eventDate,
    boolean hidden,
    BigDecimal priceJod,
    String currency,
    int capacityGuests,
    Long governorateId,
    String governorateName,
    Long subcategoryId,
    String subcategoryName,
    Long categoryId,
    String categoryName,
    String businessName,
    List<String> timeSlots,
    String description,
    String primaryPhotoUrl,
    double averageRating,
    int reviewCount,
    Instant createdAt
) {
}
