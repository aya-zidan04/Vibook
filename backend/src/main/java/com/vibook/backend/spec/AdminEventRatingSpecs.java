package com.vibook.backend.spec;

import com.vibook.backend.entity.EventRating;
import jakarta.persistence.criteria.JoinType;
import java.util.ArrayList;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class AdminEventRatingSpecs {

    private AdminEventRatingSpecs() {
    }

    public static Specification<EventRating> withFilters(Integer minRating, Boolean flaggedOnly, String search) {
        return (root, query, cb) -> {
            query.distinct(true);
            var preds = new ArrayList<jakarta.persistence.criteria.Predicate>();
            if (minRating != null) {
                preds.add(cb.greaterThanOrEqualTo(root.get("ratingValue"), minRating));
            }
            if (Boolean.TRUE.equals(flaggedOnly)) {
                preds.add(cb.isTrue(root.get("flagged")));
            }
            if (StringUtils.hasText(search)) {
                String term = "%" + search.trim().toLowerCase() + "%";
                var userJoin = root.join("user", JoinType.INNER);
                var eventJoin = root.join("businessEvent", JoinType.INNER);
                preds.add(
                    cb.or(
                        cb.like(cb.lower(userJoin.get("email")), term),
                        cb.like(cb.lower(eventJoin.get("title")), term)
                    )
                );
            }
            return preds.isEmpty() ? cb.conjunction() : cb.and(preds.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }
}
