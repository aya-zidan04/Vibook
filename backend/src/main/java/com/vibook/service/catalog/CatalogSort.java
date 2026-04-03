package com.vibook.service.catalog;

import org.springframework.data.domain.Sort;

import java.util.Locale;

public final class CatalogSort {

    private CatalogSort() {
    }

    public static Sort events(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "startAt");
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT)) {
            case "start_at_asc", "relevance" -> Sort.by(Sort.Direction.ASC, "startAt");
            case "start_at_desc" -> Sort.by(Sort.Direction.DESC, "startAt");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "priceFrom");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "priceFrom");
            case "rating_desc" -> Sort.by(Sort.Direction.DESC, "rating");
            default -> throw new IllegalArgumentException(
                    "Unsupported events sort. Use: start_at_asc, start_at_desc, price_asc, price_desc, rating_desc, relevance");
        };
    }

    public static Sort restaurants(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "name");
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT)) {
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "rating").and(Sort.by("name")); // proxy: no price column; use rating as secondary
            case "price_level_asc" -> Sort.by(Sort.Direction.ASC, "priceLevel").and(Sort.by("name"));
            case "price_level_desc" -> Sort.by(Sort.Direction.DESC, "priceLevel").and(Sort.by("name"));
            case "rating_desc" -> Sort.by(Sort.Direction.DESC, "rating");
            default -> throw new IllegalArgumentException(
                    "Unsupported restaurants sort. Use: name_asc, price_level_asc, price_level_desc, rating_desc");
        };
    }

    public static Sort experiences(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "title");
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT)) {
            case "title_asc" -> Sort.by(Sort.Direction.ASC, "title");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "priceFrom");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "priceFrom");
            case "rating_desc" -> Sort.by(Sort.Direction.DESC, "rating");
            default -> throw new IllegalArgumentException(
                    "Unsupported experiences sort. Use: title_asc, price_asc, price_desc, rating_desc");
        };
    }

    public static Sort hotels(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "name");
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT)) {
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "priceFrom");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "priceFrom");
            case "rating_desc" -> Sort.by(Sort.Direction.DESC, "rating");
            case "stars_desc" -> Sort.by(Sort.Direction.DESC, "stars");
            default -> throw new IllegalArgumentException(
                    "Unsupported hotels sort. Use: name_asc, price_asc, price_desc, rating_desc, stars_desc");
        };
    }

    public static Sort flights(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "departAt");
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT)) {
            case "depart_asc" -> Sort.by(Sort.Direction.ASC, "departAt");
            case "depart_desc" -> Sort.by(Sort.Direction.DESC, "departAt");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "airline_asc" -> Sort.by(Sort.Direction.ASC, "airline");
            default -> throw new IllegalArgumentException(
                    "Unsupported flights sort. Use: depart_asc, depart_desc, price_asc, price_desc, airline_asc");
        };
    }

    public static Sort packagesSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "title");
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT)) {
            case "title_asc" -> Sort.by(Sort.Direction.ASC, "title");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "priceFrom");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "priceFrom");
            default -> throw new IllegalArgumentException(
                    "Unsupported packages sort. Use: title_asc, price_asc, price_desc");
        };
    }

    public static Sort offers(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "endsAt");
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT)) {
            case "ends_asc" -> Sort.by(Sort.Direction.ASC, "endsAt");
            case "ends_desc" -> Sort.by(Sort.Direction.DESC, "endsAt");
            case "title_asc" -> Sort.by(Sort.Direction.ASC, "title");
            default -> throw new IllegalArgumentException(
                    "Unsupported offers sort. Use: ends_asc, ends_desc, title_asc");
        };
    }
}
