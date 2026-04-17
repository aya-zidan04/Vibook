package com.vibook.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddPaymentMethodRequest(
    @NotBlank(message = "Card number is required")
    @Size(max = 23, message = "Card number is too long")
    String cardNumber,

    @NotBlank(message = "Cardholder name is required")
    @Size(max = 120, message = "Cardholder name must not exceed 120 characters")
    String cardHolderName,

    @NotNull(message = "Expiry month is required")
    @Min(value = 1, message = "Expiry month must be between 1 and 12")
    @Max(value = 12, message = "Expiry month must be between 1 and 12")
    Integer expiryMonth,

    @NotNull(message = "Expiry year is required")
    @Min(value = 2000, message = "Expiry year is not valid")
    @Max(value = 2100, message = "Expiry year is not valid")
    Integer expiryYear,

    @NotBlank(message = "CVC is required")
    @Size(min = 3, max = 4, message = "CVC must be 3 or 4 digits")
    String cvc
) {
}
