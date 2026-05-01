package com.vibook.backend.dto;

/**
 * Result of rating an event. {@code myRating} is null only when serialized from flows that omit it;
 * after {@code POST .../rate} it is always the submitted value. {@code canRate} reflects eligible booking.
 */
public record EventRatingResponse(
    Long eventId,
    double averageRating,
    int reviewCount,
    Integer myRating,
    Long myRatingId,
    boolean canRate
) {
}
