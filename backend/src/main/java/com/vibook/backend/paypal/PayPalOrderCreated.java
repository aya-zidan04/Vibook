package com.vibook.backend.paypal;

public record PayPalOrderCreated(String orderId, String approvalUrl, String rawSummary) {}
