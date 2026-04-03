package com.vibook.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(
        Instant timestamp,
        int status,
        String message,
        String path,
        List<FieldViolation> fieldErrors
) {
    public static ApiError of(int status, String message, String path) {
        return new ApiError(Instant.now(), status, message, path, List.of());
    }

    public static ApiError withFields(int status, String message, String path, List<FieldViolation> fieldErrors) {
        return new ApiError(Instant.now(), status, message, path, fieldErrors);
    }

    public record FieldViolation(String field, String message) {
    }
}
