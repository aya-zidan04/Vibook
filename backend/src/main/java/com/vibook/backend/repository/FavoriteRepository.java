package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.Favorite;
import com.vibook.backend.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserAndBusinessEvent(User user, BusinessEvent event);

    boolean existsByUserAndBusinessEvent(User user, BusinessEvent event);

    void deleteByUserAndBusinessEvent(User user, BusinessEvent event);

    @EntityGraph(
        attributePaths = {
            "businessEvent",
            "businessEvent.subcategory",
            "businessEvent.subcategory.category",
            "businessEvent.governorate",
            "businessEvent.timeSlots",
            "businessEvent.photos",
        }
    )
    Page<Favorite> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
