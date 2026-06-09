package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.Favorite;
import com.vibook.backend.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserAndBusinessEvent(User user, BusinessEvent event);

    boolean existsByUserAndBusinessEvent(User user, BusinessEvent event);

    void deleteByUserAndBusinessEvent(User user, BusinessEvent event);

    void deleteByBusinessEvent_Id(Long eventId);

    /** Eager-fetch event metadata + photos; timeSlots load lazily (avoids MultipleBagFetchException). */
    @EntityGraph(
        attributePaths = {
            "businessEvent",
            "businessEvent.subcategory",
            "businessEvent.subcategory.category",
            "businessEvent.governorate",
            "businessEvent.photos",
        }
    )
    Page<Favorite> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    @EntityGraph(
        attributePaths = {
            "businessEvent",
            "businessEvent.subcategory",
            "businessEvent.subcategory.category",
            "businessEvent.governorate",
            "businessEvent.photos",
            "businessEvent.businessProfile",
        }
    )
    @Query(
        """
        SELECT f FROM Favorite f
        WHERE f.user = :user
          AND f.businessEvent.hidden = false
          AND f.businessEvent.businessProfile.status = com.vibook.backend.entity.BusinessProfileStatus.APPROVED
        ORDER BY f.createdAt DESC
        """
    )
    Page<Favorite> findConsumerVisibleByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);
}
