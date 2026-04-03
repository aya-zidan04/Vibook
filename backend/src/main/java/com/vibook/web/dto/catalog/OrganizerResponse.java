package com.vibook.web.dto.catalog;

import com.vibook.entity.catalog.Organizer;

import java.math.BigDecimal;

public record OrganizerResponse(
        long id,
        String name,
        String logoUrl,
        String coverUrl,
        boolean verified,
        String about,
        BigDecimal rating,
        int reviewCount
) {
    public static OrganizerResponse fromEntity(Organizer o) {
        return new OrganizerResponse(
                o.getId(),
                o.getName(),
                o.getLogoUrl(),
                o.getCoverUrl(),
                o.isVerified(),
                o.getAbout(),
                o.getRating(),
                o.getReviewCount()
        );
    }
}
