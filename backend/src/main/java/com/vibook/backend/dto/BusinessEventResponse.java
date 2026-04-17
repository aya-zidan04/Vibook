package com.vibook.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record BusinessEventResponse(
    Long id,
    Long businessProfileId,
    String title,
    Long subcategoryId,
    String subcategoryName,
    Long categoryId,
    String categoryName,
    String description,
    LocalDate eventDate,
    List<String> timeSlots,
    Long governorateId,
    String governorateName,
    String googleMapsUrl,
    BigDecimal priceJod,
    String currency,
    int capacityGuests,
    boolean hidden,
    double averageRating,
    int reviewCount,
    List<String> photoUrls,
    Instant createdAt,
    Instant updatedAt,
    /** Viewer's saved stars; null if this user has not rated yet. */
    Integer myRating,
    /** True when the viewer has a CONFIRMED or COMPLETED booking for this event. */
    Boolean canRate
) {
}
