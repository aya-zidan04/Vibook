package com.vibook.web.dto.catalog;

import com.vibook.entity.City;
import com.vibook.entity.catalog.TravelPackage;

import java.math.BigDecimal;
import java.util.List;

public record PackageResponse(
        long id,
        String title,
        List<Long> cityIds,
        String imageUrl,
        int nights,
        BigDecimal priceFrom,
        String currency,
        String badge
) {
    public static PackageResponse fromEntity(TravelPackage p) {
        List<Long> cityIds = p.getCities().stream().map(City::getId).sorted().toList();
        return new PackageResponse(
                p.getId(),
                p.getTitle(),
                cityIds,
                p.getImageUrl(),
                p.getNights(),
                p.getPriceFrom(),
                p.getCurrency().name(),
                p.getBadge()
        );
    }
}
