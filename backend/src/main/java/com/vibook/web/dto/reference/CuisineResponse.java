package com.vibook.web.dto.reference;

import com.vibook.entity.Cuisine;

public record CuisineResponse(
        long id,
        String slug,
        String labelEn,
        String labelAr,
        String icon
) {
    public static CuisineResponse fromEntity(Cuisine c) {
        return new CuisineResponse(
                c.getId(),
                c.getSlug(),
                c.getLabelEn(),
                c.getLabelAr(),
                c.getIcon()
        );
    }
}
