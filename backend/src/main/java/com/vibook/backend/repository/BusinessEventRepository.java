package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BusinessEventRepository extends JpaRepository<BusinessEvent, Long> {

    @EntityGraph(
        attributePaths = {
            "subcategory",
            "subcategory.category",
            "governorate",
            "timeSlots",
            "photos",
        }
    )
    List<BusinessEvent> findAllByBusinessProfileOrderByCreatedAtDesc(BusinessProfile businessProfile);

    @EntityGraph(
        attributePaths = {
            "subcategory",
            "subcategory.category",
            "governorate",
            "timeSlots",
            "photos",
        }
    )
    List<BusinessEvent> findAllByOrderByCreatedAtDesc();

    @EntityGraph(
        attributePaths = {
            "businessProfile",
            "businessProfile.user",
            "subcategory",
            "subcategory.category",
            "governorate",
            "timeSlots",
            "photos",
        }
    )
    @Query("SELECT e FROM BusinessEvent e WHERE e.id = :id")
    Optional<BusinessEvent> findWithDetailsById(@Param("id") Long id);
}
