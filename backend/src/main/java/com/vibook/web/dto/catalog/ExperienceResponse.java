package com.vibook.web.dto.catalog;

import com.vibook.entity.catalog.Experience;

import java.math.BigDecimal;

public record ExperienceResponse(
        long id,
        String title,
        long categoryId,
        long cityId,
        String imageUrl,
        BigDecimal durationHours,
        BigDecimal priceFrom,
        String currency,
        BigDecimal rating,
        String badge
) {
    public static ExperienceResponse fromEntity(Experience x) {
        return new ExperienceResponse(
                x.getId(),
                x.getTitle(),
                x.getCategory().getId(),
                x.getCity().getId(),
                x.getImageUrl(),
                x.getDurationHours(),
                x.getPriceFrom(),
                x.getCurrency().name(),
                x.getRating(),
                x.getBadge()
        );
    }
}
