package com.vibook.entity.enums;

import java.util.Locale;

/** Matches mobile {@code BookingStatus} string values. */
public enum BookingStatus {
    UPCOMING("upcoming"),
    PAST("past"),
    CANCELLED("cancelled"),
    PENDING_PAYMENT("pending_payment");

    private final String apiKey;

    BookingStatus(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiKey() {
        return apiKey;
    }

    public static BookingStatus fromApiValue(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("status is required");
        }
        String t = raw.trim().toLowerCase(Locale.ROOT);
        for (BookingStatus v : values()) {
            if (v.apiKey.equals(t)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown booking status: " + raw);
    }
}
