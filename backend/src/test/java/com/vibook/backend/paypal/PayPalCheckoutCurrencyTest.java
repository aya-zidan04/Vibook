package com.vibook.backend.paypal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class PayPalCheckoutCurrencyTest {

    @Test
    void forOrder_sandboxJod_convertsToUsd() {
        var result = PayPalCheckoutCurrency.forOrder(new BigDecimal("28.00"), "JOD", true);

        assertThat(result.currencyCode()).isEqualTo("USD");
        assertThat(result.amount()).isEqualByComparingTo("39.48");
        assertThat(result.convertedFromJod()).isTrue();
    }

    @Test
    void forOrder_usd_passesThrough() {
        var result = PayPalCheckoutCurrency.forOrder(new BigDecimal("10.00"), "USD", true);

        assertThat(result.currencyCode()).isEqualTo("USD");
        assertThat(result.amount()).isEqualByComparingTo("10.00");
        assertThat(result.convertedFromJod()).isFalse();
    }

    @Test
    void forOrder_unsupportedNonSandbox_throws() {
        assertThatThrownBy(() -> PayPalCheckoutCurrency.forOrder(new BigDecimal("10.00"), "JOD", false))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("JOD");
    }
}
