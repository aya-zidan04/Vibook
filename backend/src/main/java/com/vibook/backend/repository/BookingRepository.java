package com.vibook.backend.repository;

import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.User;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByUserAndBusinessEvent(User user, BusinessEvent businessEvent);

    boolean existsByUserAndBusinessEventAndStatusIn(
        User user,
        BusinessEvent businessEvent,
        Collection<BookingStatus> statuses
    );
}
