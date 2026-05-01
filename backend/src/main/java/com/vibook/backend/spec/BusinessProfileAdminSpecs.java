package com.vibook.backend.spec;

import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public final class BusinessProfileAdminSpecs {

    private BusinessProfileAdminSpecs() {
    }

    public static Specification<BusinessProfile> withFilters(
        BusinessProfileStatus status,
        Long categoryId,
        Long governorateId,
        Instant createdFrom,
        Instant createdTo
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("primaryCategory").get("id"), categoryId));
            }
            if (governorateId != null) {
                predicates.add(cb.equal(root.get("governorate").get("id"), governorateId));
            }
            if (createdFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
            }
            if (createdTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), createdTo));
            }
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
