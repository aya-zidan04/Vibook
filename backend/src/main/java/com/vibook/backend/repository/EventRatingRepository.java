package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.EventRating;
import com.vibook.backend.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRatingRepository extends JpaRepository<EventRating, Long> {

    Optional<EventRating> findByUserAndBusinessEvent(User user, BusinessEvent businessEvent);

    boolean existsByUserAndBusinessEvent(User user, BusinessEvent businessEvent);
}
