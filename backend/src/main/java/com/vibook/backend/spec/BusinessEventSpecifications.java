package com.vibook.backend.spec;

import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessProfileStatus;
import jakarta.persistence.criteria.JoinType;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class BusinessEventSpecifications {

    private BusinessEventSpecifications() {
    }

    public static Specification<BusinessEvent> visibleForViewer(boolean includeHidden, boolean viewerIsAdmin) {
        return (root, query, cb) -> {
            query.distinct(true);
            if (includeHidden && viewerIsAdmin) {
                return cb.conjunction();
            }
            return cb.isFalse(root.get("hidden"));
        };
    }

    public static Specification<BusinessEvent> governorateIdEquals(Long governorateId) {
        if (governorateId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("governorate").get("id"), governorateId);
    }

    public static Specification<BusinessEvent> subcategoryIdEquals(Long subcategoryId) {
        if (subcategoryId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("subcategory").get("id"), subcategoryId);
    }

    public static Specification<BusinessEvent> categoryIdEquals(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return (root, query, cb) -> {
            var sub = root.join("subcategory", JoinType.INNER);
            var cat = sub.join("category", JoinType.INNER);
            return cb.equal(cat.get("id"), categoryId);
        };
    }

    public static Specification<BusinessEvent> eventDateEquals(LocalDate date) {
        if (date == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("eventDate"), date);
    }

    /** Consumer explore: only upcoming events (inclusive of today). */
    public static Specification<BusinessEvent> eventDateOnOrAfter(LocalDate minDate) {
        if (minDate == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("eventDate"), minDate);
    }

    /** Consumer explore: only events from admin-approved business profiles. */
    public static Specification<BusinessEvent> businessProfileApproved() {
        return (root, query, cb) -> {
            var profile = root.join("businessProfile", JoinType.INNER);
            return cb.equal(profile.get("status"), BusinessProfileStatus.APPROVED);
        };
    }

    public static Specification<BusinessEvent> keywordContains(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("title")), pattern),
            cb.like(cb.lower(root.get("description")), pattern)
        );
    }

    public static Specification<BusinessEvent> minPriceAtLeast(BigDecimal minPrice) {
        if (minPrice == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("priceJod"), minPrice);
    }

    public static Specification<BusinessEvent> maxPriceAtMost(BigDecimal maxPrice) {
        if (maxPrice == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("priceJod"), maxPrice);
    }

    public static Specification<BusinessEvent> combine(Specification<BusinessEvent> base, Specification<BusinessEvent> next) {
        if (next == null) {
            return base;
        }
        if (base == null) {
            return next;
        }
        return base.and(next);
    }
}
