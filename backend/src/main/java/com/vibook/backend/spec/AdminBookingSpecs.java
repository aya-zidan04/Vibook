package com.vibook.backend.spec;

import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import jakarta.persistence.criteria.JoinType;
import java.time.LocalDate;
import java.util.ArrayList;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class AdminBookingSpecs {

    private AdminBookingSpecs() {
    }

    public static Specification<Booking> withFilters(
        BookingStatus status,
        Long businessProfileId,
        LocalDate dateFrom,
        LocalDate dateTo,
        String search
    ) {
        return (root, query, cb) -> {
            query.distinct(true);
            var preds = new ArrayList<jakarta.persistence.criteria.Predicate>();
            var eventJoin = root.join("businessEvent", JoinType.INNER);
            if (status != null) {
                preds.add(cb.equal(root.get("status"), status));
            }
            if (businessProfileId != null) {
                var profileJoin = eventJoin.join("businessProfile", JoinType.INNER);
                preds.add(cb.equal(profileJoin.get("id"), businessProfileId));
            }
            if (dateFrom != null) {
                preds.add(cb.greaterThanOrEqualTo(eventJoin.get("eventDate"), dateFrom));
            }
            if (dateTo != null) {
                preds.add(cb.lessThanOrEqualTo(eventJoin.get("eventDate"), dateTo));
            }
            if (StringUtils.hasText(search)) {
                String term = "%" + search.trim().toLowerCase() + "%";
                var userJoin = root.join("user", JoinType.INNER);
                preds.add(
                    cb.or(
                        cb.like(cb.lower(eventJoin.get("title")), term),
                        cb.like(cb.lower(userJoin.get("email")), term)
                    )
                );
            }
            return preds.isEmpty() ? cb.conjunction() : cb.and(preds.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }
}
