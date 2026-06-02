package com.vibook.backend.dto;

public record PayPalCaptureOrderResponse(
    Long paymentId,
    Long bookingId,
    String paypalOrderId,
    String paypalCaptureId,
    String paymentStatus,
    String bookingStatus
) {}
