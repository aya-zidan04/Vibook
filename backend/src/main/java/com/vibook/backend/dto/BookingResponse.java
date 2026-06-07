package com.vibook.backend.dto;

import com.vibook.backend.entity.BookingStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record BookingResponse(
    Long id,
    Long eventId,
    String eventTitle,
    /** First event photo URL for booking cards. */
    String eventPrimaryPhotoUrl,
    /** All event photo URLs (same order as the event detail gallery). */
    List<String> eventPhotoUrls,
    Long userId,
    String userEmail,
    String userFirstName,
    String userLastName,
    /** Trimmed first + last; null when both empty. */
    String userFullName,
    String userPhone,
    BookingStatus status,
    LocalDate eventDate,
    Long timeSlotId,
    String timeSlotLabel,
    int guestsCount,
    BigDecimal totalPriceJod,
    String currency,
    String note,
    String cancelReason,
    Instant createdAt,
    Instant updatedAt
) {
}
