package com.vibook.backend.dto;

import com.vibook.backend.entity.BookingStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record AdminBookingResponse(
    Long id,
    Long eventId,
    String eventTitle,
    Long businessProfileId,
    String businessName,
    Long userId,
    String userEmail,
    BookingStatus status,
    LocalDate eventDate,
    Long timeSlotId,
    String timeSlotLabel,
    int guestsCount,
    BigDecimal totalPriceJod,
    String note,
    String cancelReason,
    Instant createdAt,
    Instant updatedAt
) {
}
