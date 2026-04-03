package com.vibook.entity.enums;

import java.util.Locale;

/**
 * Catalog vertical for private ratings and favorites. Matches mobile {@code RatingVertical}
 * ({@code stay} for hotels). API may accept {@code hotel} as an alias for {@link #STAY}.
 */
public enum ListingVertical {
    EVENT("event"),
    RESTAURANT("restaurant"),
    EXPERIENCE("experience"),
    STAY("stay"),
    ORGANIZER("organizer"),
    PACKAGE("package"),
    FLIGHT("flight");

    private final String apiKey;

    ListingVertical(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiKey() {
        return apiKey;
    }

    public static ListingVertical fromApiPath(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("vertical is required");
        }
        String t = raw.trim().toLowerCase(Locale.ROOT);
        if ("hotel".equals(t)) {
            return STAY;
        }
        for (ListingVertical v : values()) {
            if (v.apiKey.equals(t)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown vertical: " + raw);
    }
}
