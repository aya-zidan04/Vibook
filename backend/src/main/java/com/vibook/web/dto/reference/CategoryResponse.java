package com.vibook.web.dto.reference;

import com.vibook.entity.Category;

public record CategoryResponse(
        long id,
        String slug,
        String labelEn,
        String labelAr,
        String icon
) {
    public static CategoryResponse fromEntity(Category c) {
        return new CategoryResponse(
                c.getId(),
                c.getSlug(),
                c.getLabelEn(),
                c.getLabelAr(),
                c.getIcon()
        );
    }
}
