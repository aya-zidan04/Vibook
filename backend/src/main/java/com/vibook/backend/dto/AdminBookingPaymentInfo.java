package com.vibook.backend.dto;

import java.math.BigDecimal;

public record AdminBookingPaymentInfo(
    Long paymentId,
    String provider,
    String paymentStatus,
    String paypalOrderId,
    String paypalCaptureId,
    BigDecimal amount,
    String currency,
    boolean confirmedByPayPalCapture
) {}
