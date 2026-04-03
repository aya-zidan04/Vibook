package com.vibook.web.dto.catalog;

import com.vibook.entity.Cuisine;
import com.vibook.entity.catalog.Restaurant;

import java.math.BigDecimal;
import java.util.List;

public record RestaurantResponse(
        long id,
        String name,
        List<Long> cuisineIds,
        long cityId,
        String imageUrl,
        int priceLevel,
        BigDecimal rating,
        int reviewCount,
        String badge
) {
    public static RestaurantResponse fromEntity(Restaurant r) {
        List<Long> cuisineIds = r.getCuisines().stream()
                .map(Cuisine::getId)
                .sorted()
                .toList();
        return new RestaurantResponse(
                r.getId(),
                r.getName(),
                cuisineIds,
                r.getCity().getId(),
                r.getImageUrl(),
                r.getPriceLevel(),
                r.getRating(),
                r.getReviewCount(),
                r.getBadge()
        );
    }
}
