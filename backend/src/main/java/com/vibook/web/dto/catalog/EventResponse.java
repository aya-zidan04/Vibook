package com.vibook.web.dto.catalog;

import com.vibook.entity.catalog.Event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record EventResponse(
        long id,
        String title,
        long categoryId,
        long cityId,
        long organizerId,
        String imageUrl,
        List<String> gallery,
        Instant startAt,
        Instant endAt,
        String venueName,
        String address,
        String description,
        BigDecimal priceFrom,
        String currency,
        BigDecimal rating,
        int reviewCount,
        String badge
) {
    public static EventResponse fromEntity(Event e) {
        List<String> g = e.getGallery() == null ? List.of() : List.copyOf(e.getGallery());
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getCategory().getId(),
                e.getCity().getId(),
                e.getOrganizer().getId(),
                e.getImageUrl(),
                g,
                e.getStartAt(),
                e.getEndAt(),
                e.getVenueName(),
                e.getAddress(),
                e.getDescription(),
                e.getPriceFrom(),
                e.getCurrency().name(),
                e.getRating(),
                e.getReviewCount(),
                e.getBadge()
        );
    }
}
