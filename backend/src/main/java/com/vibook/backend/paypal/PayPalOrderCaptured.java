package com.vibook.backend.paypal;

public record PayPalOrderCaptured(String orderId, String captureId, String status, String rawSummary) {}
