package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.EventRating;
import com.vibook.backend.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRatingRepository extends JpaRepository<EventRating, Long>, JpaSpecificationExecutor<EventRating> {

    Optional<EventRating> findByUserAndBusinessEvent(User user, BusinessEvent businessEvent);

    boolean existsByUserAndBusinessEvent(User user, BusinessEvent businessEvent);

    @Query(
        "SELECT COALESCE(AVG(r.ratingValue), 0.0), COUNT(r) FROM EventRating r WHERE r.businessEvent.id = :eventId AND r.moderationHidden = false"
    )
    Object[] averageAndCountVisible(@Param("eventId") Long eventId);
}
