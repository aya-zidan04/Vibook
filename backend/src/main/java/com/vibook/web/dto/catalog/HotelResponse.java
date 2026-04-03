package com.vibook.web.dto.catalog;

import com.vibook.entity.catalog.Hotel;

import java.math.BigDecimal;

public record HotelResponse(
        long id,
        String name,
        long cityId,
        String imageUrl,
        int stars,
        BigDecimal priceFrom,
        String currency,
        BigDecimal rating,
        String badge
) {
    public static HotelResponse fromEntity(Hotel h) {
        return new HotelResponse(
                h.getId(),
                h.getName(),
                h.getCity().getId(),
                h.getImageUrl(),
                h.getStars(),
                h.getPriceFrom(),
                h.getCurrency().name(),
                h.getRating(),
                h.getBadge()
        );
    }
}
