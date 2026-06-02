package com.vibook.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties(prefix = "vibook.paypal")
public record PayPalProperties(
    String mode,
    String clientId,
    String clientSecret,
    String baseUrl,
    String returnUrl,
    String cancelUrl
) {
    public boolean isConfigured() {
        return StringUtils.hasText(clientId) && StringUtils.hasText(clientSecret);
    }

    public void requireSandbox() {
        if (!"sandbox".equalsIgnoreCase(mode)) {
            throw new IllegalStateException("PayPal mode must be sandbox (live PayPal is disabled)");
        }
        if (!StringUtils.hasText(baseUrl) || !baseUrl.toLowerCase().contains("sandbox")) {
            throw new IllegalStateException("PayPal base URL must use the sandbox API host");
        }
    }
}
