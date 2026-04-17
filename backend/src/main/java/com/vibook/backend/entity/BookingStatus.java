package com.vibook.backend.entity;

/**
 * Lifecycle of a user's booking for a {@link BusinessEvent}.
 * Ratings are allowed only for {@link #CONFIRMED} or {@link #COMPLETED}.
 */
public enum BookingStatus {
    PENDING,
    CONFIRMED,
    COMPLETED,
    CANCELLED
}
