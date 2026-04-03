package com.vibook.web.dto.rating;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * {@code stars} null clears the rating (row removed). Otherwise 1–5 inclusive.
 */
@JsonInclude(JsonInclude.Include.ALWAYS)
public record UpsertRatingRequest(Integer stars) {
}
