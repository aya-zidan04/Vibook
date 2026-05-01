package com.vibook.backend.spec;

import com.vibook.backend.entity.BusinessEvent;
import jakarta.persistence.criteria.JoinType;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class AdminBusinessEventSpecs {

    private AdminBusinessEventSpecs() {
    }

    public static Specification<BusinessEvent> withFilters(Long categoryId, Long governorateId, String visibility, String search) {
        return (root, query, cb) -> {
            query.distinct(true);
            var preds = new ArrayList<jakarta.persistence.criteria.Predicate>();
            if (categoryId != null) {
                var subJoin = root.join("subcategory", JoinType.INNER);
                var catJoin = subJoin.join("category", JoinType.INNER);
                preds.add(cb.equal(catJoin.get("id"), categoryId));
            }
            if (governorateId != null) {
                preds.add(cb.equal(root.join("governorate", JoinType.INNER).get("id"), governorateId));
            }
            if (StringUtils.hasText(visibility)) {
                String v = visibility.trim().toUpperCase();
                if ("VISIBLE".equals(v)) {
                    preds.add(cb.isFalse(root.get("hidden")));
                } else if ("HIDDEN".equals(v)) {
                    preds.add(cb.isTrue(root.get("hidden")));
                } else if ("DRAFT".equals(v)) {
                    preds.add(cb.disjunction());
                }
            }
            if (StringUtils.hasText(search)) {
                String term = "%" + search.trim().toLowerCase() + "%";
                preds.add(cb.like(cb.lower(root.get("title")), term));
            }
            return preds.isEmpty() ? cb.conjunction() : cb.and(preds.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }
}
