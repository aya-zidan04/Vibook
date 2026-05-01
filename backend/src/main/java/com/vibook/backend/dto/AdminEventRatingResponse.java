package com.vibook.backend.dto;

import java.time.Instant;

public record AdminEventRatingResponse(
    Long id,
    Long userId,
    String userEmail,
    Long eventId,
    String eventTitle,
    Long businessProfileId,
    String businessName,
    int ratingValue,
    boolean moderationHidden,
    boolean flagged,
    Instant createdAt
) {
}
