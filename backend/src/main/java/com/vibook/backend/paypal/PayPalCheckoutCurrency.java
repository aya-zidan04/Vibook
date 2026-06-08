package com.vibook.backend.paypal;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.Set;

/**
 * PayPal Orders API supports a limited ISO-4217 set (no JOD). In sandbox we charge USD
 * using a fixed JOD→USD rate so checkout works while bookings still store JOD totals.
 */
public final class PayPalCheckoutCurrency {

    private static final Set<String> PAYPAL_SUPPORTED = Set.of(
        "AUD", "BRL", "CAD", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "ILS",
        "JPY", "MYR", "MXN", "NOK", "NZD", "PHP", "PLN", "RUB", "SGD", "SEK", "CHF",
        "THB", "TWD", "USD"
    );

    /** Approximate sandbox conversion when event currency is JOD. */
    private static final BigDecimal SANDBOX_JOD_TO_USD = new BigDecimal("1.41");

    private PayPalCheckoutCurrency() {
    }

    public record CheckoutAmount(BigDecimal amount, String currencyCode, boolean convertedFromJod) {}

    public static CheckoutAmount forOrder(BigDecimal bookingAmount, String eventCurrency, boolean sandbox) {
        String code = normalize(eventCurrency);
        if (PAYPAL_SUPPORTED.contains(code)) {
            return new CheckoutAmount(scale(bookingAmount), code, false);
        }
        if (sandbox && "JOD".equals(code)) {
            BigDecimal usd = scale(bookingAmount.multiply(SANDBOX_JOD_TO_USD));
            return new CheckoutAmount(usd, "USD", true);
        }
        throw new IllegalArgumentException("Currency is not supported by PayPal checkout: " + code);
    }

    private static String normalize(String currency) {
        return currency == null ? "" : currency.trim().toUpperCase(Locale.ROOT);
    }

    private static BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
