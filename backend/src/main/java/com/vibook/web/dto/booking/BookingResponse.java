package com.vibook.web.dto.booking;

import com.vibook.entity.Booking;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BookingResponse(
        String id,
        String userId,
        String type,
        long refId,
        String refTitle,
        String refTitleAr,
        String imageUrl,
        String status,
        Instant startsAt,
        String cityName,
        String cityNameAr,
        BigDecimal totalPaid,
        String currency,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal fees,
        String paymentReference,
        Instant createdAt,
        Instant updatedAt
) {
    public static BookingResponse fromEntity(Booking b) {
        UUID uid = b.getUser().getId();
        return new BookingResponse(
                b.getId().toString(),
                uid.toString(),
                b.getBookingType().getApiKey(),
                b.getRefId(),
                b.getRefTitle(),
                b.getRefTitleAr(),
                b.getImageUrl(),
                b.getStatus().getApiKey(),
                b.getStartsAt(),
                b.getCityName(),
                b.getCityNameAr(),
                b.getTotalPaid(),
                b.getCurrency().name(),
                b.getQuantity(),
                b.getUnitPrice(),
                b.getFees(),
                b.getPaymentReference(),
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }
}
