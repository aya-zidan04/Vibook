package com.vibook.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

/**
 * Supported wallet and catalog currencies. Persisted as {@code VARCHAR(3)} via {@code @Enumerated(STRING)}.
 */
public enum Currency {
    JOD,
    USD;

    @JsonValue
    public String toJson() {
        return name();
    }

    @JsonCreator
    public static Currency fromJson(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return Currency.valueOf(raw.trim().toUpperCase(Locale.ROOT));
    }
}
