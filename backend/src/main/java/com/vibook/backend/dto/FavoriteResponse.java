package com.vibook.backend.dto;

import java.time.Instant;

public record FavoriteResponse(Long id, Long eventId, String eventTitle, Instant createdAt) {
}
