package com.vibook.web.dto.reference;

import com.vibook.entity.City;

public record CityResponse(
        long id,
        String nameEn,
        String nameAr,
        String country,
        String imageUrl
) {
    public static CityResponse fromEntity(City c) {
        return new CityResponse(
                c.getId(),
                c.getNameEn(),
                c.getNameAr(),
                c.getCountry(),
                c.getImageUrl()
        );
    }
}
