package com.vibook.entity.enums;

import java.util.Locale;

/** Matches mobile notification {@code kind} literals. */
public enum NotificationKind {
    BOOKING("booking"),
    PROMO("promo"),
    REMINDER("reminder"),
    PRICE("price"),
    WISHLIST("wishlist");

    private final String apiKey;

    NotificationKind(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiKey() {
        return apiKey;
    }

    public static NotificationKind fromApiValue(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("kind is required");
        }
        String t = raw.trim().toLowerCase(Locale.ROOT);
        for (NotificationKind v : values()) {
            if (v.apiKey.equals(t)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown notification kind: " + raw);
    }
}
