package com.vibook.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record AdminEventRowResponse(
    Long id,
    String title,
    Long businessProfileId,
    String businessName,
    String categoryName,
    String subcategoryName,
    String governorateName,
    LocalDate eventDate,
    /** Slot labels in sort order (e.g. "7:30 PM"). */
    List<String> timeSlots,
    BigDecimal priceJod,
    String currency,
    int capacityGuests,
    int photoCount,
    /** VISIBLE or HIDDEN (no separate approval workflow). */
    String visibilityStatus,
    Instant createdAt
) {
}
