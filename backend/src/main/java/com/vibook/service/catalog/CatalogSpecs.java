package com.vibook.service.catalog;

import com.vibook.entity.catalog.Event;
import com.vibook.entity.catalog.Experience;
import com.vibook.entity.catalog.Flight;
import com.vibook.entity.catalog.Hotel;
import com.vibook.entity.catalog.Offer;
import com.vibook.entity.catalog.Restaurant;
import com.vibook.entity.catalog.TravelPackage;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class CatalogSpecs {

    private CatalogSpecs() {
    }

    private static String escapeLike(String raw) {
        return raw.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    public static Specification<Event> events(
            Long cityId,
            Long categoryId,
            Long organizerId,
            String q
    ) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (cityId != null) {
                p.add(cb.equal(root.get("city").get("id"), cityId));
            }
            if (categoryId != null) {
                p.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (organizerId != null) {
                p.add(cb.equal(root.get("organizer").get("id"), organizerId));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + escapeLike(q.toLowerCase(Locale.ROOT)) + "%";
                p.add(cb.like(cb.lower(root.get("title")), pattern, '\\'));
            }
            return p.isEmpty() ? cb.conjunction() : cb.and(p.toArray(Predicate[]::new));
        };
    }

    public static Specification<Restaurant> restaurants(Long cityId, Long cuisineId, String q) {
        return (root, query, cb) -> {
            if (cuisineId != null && Restaurant.class.equals(query.getResultType())) {
                query.distinct(true);
            }
            List<Predicate> p = new ArrayList<>();
            if (cityId != null) {
                p.add(cb.equal(root.get("city").get("id"), cityId));
            }
            if (cuisineId != null) {
                Join<?, ?> cj = root.join("cuisines", JoinType.INNER);
                p.add(cb.equal(cj.get("id"), cuisineId));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + escapeLike(q.toLowerCase(Locale.ROOT)) + "%";
                p.add(cb.like(cb.lower(root.get("name")), pattern, '\\'));
            }
            return p.isEmpty() ? cb.conjunction() : cb.and(p.toArray(Predicate[]::new));
        };
    }

    public static Specification<Experience> experiences(Long cityId, Long categoryId, String q) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (cityId != null) {
                p.add(cb.equal(root.get("city").get("id"), cityId));
            }
            if (categoryId != null) {
                p.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + escapeLike(q.toLowerCase(Locale.ROOT)) + "%";
                p.add(cb.like(cb.lower(root.get("title")), pattern, '\\'));
            }
            return p.isEmpty() ? cb.conjunction() : cb.and(p.toArray(Predicate[]::new));
        };
    }

    public static Specification<Hotel> hotels(Long cityId, String q) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (cityId != null) {
                p.add(cb.equal(root.get("city").get("id"), cityId));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + escapeLike(q.toLowerCase(Locale.ROOT)) + "%";
                p.add(cb.like(cb.lower(root.get("name")), pattern, '\\'));
            }
            return p.isEmpty() ? cb.conjunction() : cb.and(p.toArray(Predicate[]::new));
        };
    }

    public static Specification<Flight> flights(String q, String fromCode, String toCode) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (fromCode != null && !fromCode.isBlank()) {
                p.add(cb.equal(cb.upper(root.get("fromCode")), fromCode.trim().toUpperCase(Locale.ROOT)));
            }
            if (toCode != null && !toCode.isBlank()) {
                p.add(cb.equal(cb.upper(root.get("toCode")), toCode.trim().toUpperCase(Locale.ROOT)));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + escapeLike(q.toLowerCase(Locale.ROOT)) + "%";
                Predicate airline = cb.like(cb.lower(root.get("airline")), pattern, '\\');
                Predicate from = cb.like(cb.lower(root.get("fromCode")), pattern, '\\');
                Predicate to = cb.like(cb.lower(root.get("toCode")), pattern, '\\');
                p.add(cb.or(airline, from, to));
            }
            return p.isEmpty() ? cb.conjunction() : cb.and(p.toArray(Predicate[]::new));
        };
    }

    public static Specification<TravelPackage> packages(Long cityId, String q) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (cityId != null) {
                if (TravelPackage.class.equals(query.getResultType())) {
                    query.distinct(true);
                }
                Join<?, ?> cj = root.join("cities", JoinType.INNER);
                p.add(cb.equal(cj.get("id"), cityId));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + escapeLike(q.toLowerCase(Locale.ROOT)) + "%";
                p.add(cb.like(cb.lower(root.get("title")), pattern, '\\'));
            }
            return p.isEmpty() ? cb.conjunction() : cb.and(p.toArray(Predicate[]::new));
        };
    }

    public static Specification<Offer> offers(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + escapeLike(q.toLowerCase(Locale.ROOT)) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern, '\\'),
                    cb.like(cb.lower(root.get("subtitle")), pattern, '\\')
            );
        };
    }
}
