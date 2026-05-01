package com.vibook.backend.repository;

import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.User;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByUserAndBusinessEvent(User user, BusinessEvent businessEvent);

    boolean existsByUserAndBusinessEventAndStatusIn(
        User user,
        BusinessEvent businessEvent,
        Collection<BookingStatus> statuses
    );

    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    Optional<Booking> findByIdAndUser(Long id, User user);

    List<Booking> findByBusinessEvent_BusinessProfileOrderByCreatedAtDesc(BusinessProfile businessProfile);

    Optional<Booking> findByIdAndBusinessEvent_BusinessProfile(Long id, BusinessProfile businessProfile);

    @Query(
        "SELECT COALESCE(SUM(b.guestsCount), 0) FROM Booking b WHERE b.businessEvent.id = :eventId AND b.status IN :statuses"
    )
    int sumGuestsByEventIdAndStatusIn(@Param("eventId") Long eventId, @Param("statuses") Collection<BookingStatus> statuses);

    List<Booking> findAllByOrderByCreatedAtDesc();
}
