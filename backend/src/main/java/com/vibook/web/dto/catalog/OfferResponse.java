package com.vibook.web.dto.catalog;

import com.vibook.entity.catalog.Offer;

import java.time.Instant;

public record OfferResponse(
        long id,
        String title,
        String subtitle,
        String imageUrl,
        Integer discountPercent,
        Instant endsAt,
        String targetType,
        Long targetId
) {
    public static OfferResponse fromEntity(Offer o) {
        return new OfferResponse(
                o.getId(),
                o.getTitle(),
                o.getSubtitle(),
                o.getImageUrl(),
                o.getDiscountPercent(),
                o.getEndsAt(),
                o.getTargetType(),
                o.getTargetId()
        );
    }
}
