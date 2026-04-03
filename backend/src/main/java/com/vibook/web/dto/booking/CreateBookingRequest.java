package com.vibook.web.dto.booking;

import com.vibook.entity.enums.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Mirrors mobile checkout / {@code BookingDraft}: either {@code totalPaid} or {@code unitPrice} (with {@code quantity}) is required.
 */
public record CreateBookingRequest(
        @NotBlank String type,
        @NotNull @Positive Long refId,
        @NotBlank @Size(max = 500) String refTitle,
        @Size(max = 500) String refTitleAr,
        @NotBlank @Size(max = 1024) String imageUrl,
        @NotNull Instant startsAt,
        @NotBlank @Size(max = 200) String cityName,
        @Size(max = 200) String cityNameAr,
        @Positive Integer quantity,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal unitPrice,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal fees,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal totalPaid,
        @NotNull Currency currency,
        @Size(max = 255) String paymentReference
) {
}
