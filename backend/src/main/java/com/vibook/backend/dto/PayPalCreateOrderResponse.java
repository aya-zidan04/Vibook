package com.vibook.backend.dto;

import java.math.BigDecimal;

public record PayPalCreateOrderResponse(
    Long paymentId,
    Long bookingId,
    Long eventId,
    String paypalOrderId,
    String approvalUrl,
    BigDecimal amount,
    String currency,
    String paymentStatus,
    String bookingStatus
) {}
