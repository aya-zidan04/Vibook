package com.vibook.backend.dto;

public record PaymentMethodResponse(
    Long id,
    String brand,
    String last4,
    Integer expiryMonth,
    Integer expiryYear,
    String cardHolderName,
    boolean isDefault
) {
}
