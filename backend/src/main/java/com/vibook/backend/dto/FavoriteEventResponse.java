package com.vibook.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Consumer favorites list row — card-friendly fields; {@code favorited} is always true in this list. */
public record FavoriteEventResponse(
    Long id,
    String title,
    String description,
    LocalDate eventDate,
    List<String> timeSlots,
    String governorateName,
    String subcategoryName,
    String categoryName,
    BigDecimal priceJod,
    String currency,
    String coverPhotoUrl,
    double averageRating,
    int reviewCount,
    boolean hidden,
    boolean favorited,
    Instant favoriteCreatedAt
) {
}
