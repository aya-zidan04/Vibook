package com.vibook.entity.enums;

import java.util.Locale;

/** Aligns with mobile {@code Booking.type}. */
public enum BookingType {
    EVENT("event"),
    RESTAURANT("restaurant"),
    HOTEL("hotel"),
    FLIGHT("flight"),
    EXPERIENCE("experience"),
    PACKAGE("package");

    private final String apiKey;

    BookingType(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiKey() {
        return apiKey;
    }

    public static BookingType fromApiValue(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("type is required");
        }
        String t = raw.trim().toLowerCase(Locale.ROOT);
        for (BookingType v : values()) {
            if (v.apiKey.equals(t)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown booking type: " + raw);
    }
}
