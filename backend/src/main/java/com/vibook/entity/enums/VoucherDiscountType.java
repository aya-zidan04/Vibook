package com.vibook.entity.enums;

import java.util.Locale;

/** Maps to mobile {@code discountType}: {@code percent} | {@code fixed}. */
public enum VoucherDiscountType {
    PERCENT("percent"),
    FIXED("fixed");

    private final String apiKey;

    VoucherDiscountType(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiKey() {
        return apiKey;
    }

    public static VoucherDiscountType fromApiValue(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("discount type is required");
        }
        String t = raw.trim().toLowerCase(Locale.ROOT);
        for (VoucherDiscountType v : values()) {
            if (v.apiKey.equals(t)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown discount type: " + raw);
    }
}
