package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BusinessEventRepository extends JpaRepository<BusinessEvent, Long>, JpaSpecificationExecutor<BusinessEvent> {

    @EntityGraph(
        attributePaths = {
            "businessProfile",
            "subcategory",
            "subcategory.category",
            "governorate",
            "timeSlots",
        }
    )
    Page<BusinessEvent> findAll(Specification<BusinessEvent> spec, Pageable pageable);

    @EntityGraph(
        attributePaths = {
            "subcategory",
            "subcategory.category",
            "governorate",
            "timeSlots",
        }
    )
    List<BusinessEvent> findAllByBusinessProfileOrderByCreatedAtDesc(BusinessProfile businessProfile);

    @EntityGraph(
        attributePaths = {
            "subcategory",
            "subcategory.category",
            "governorate",
            "timeSlots",
        }
    )
    List<BusinessEvent> findAllByOrderByCreatedAtDesc();

    /** Photos load via {@link BusinessEvent#photos} @BatchSize — avoid dual-bag EntityGraph fetch. */
    @EntityGraph(
        attributePaths = {
            "businessProfile",
            "businessProfile.user",
            "subcategory",
            "subcategory.category",
            "governorate",
            "timeSlots",
        }
    )
    @Query("SELECT e FROM BusinessEvent e WHERE e.id = :id")
    Optional<BusinessEvent> findWithDetailsById(@Param("id") Long id);
}
