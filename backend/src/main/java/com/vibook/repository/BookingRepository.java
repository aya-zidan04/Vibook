package com.vibook.repository;

import com.vibook.entity.Booking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    @EntityGraph(attributePaths = "user")
    @Query("select b from Booking b where b.user.id = :userId order by b.startsAt desc")
    List<Booking> findAllForUserOrderByStartsAtDesc(@Param("userId") UUID userId);

    @EntityGraph(attributePaths = "user")
    @Query("select b from Booking b where b.id = :id and b.user.id = :userId")
    Optional<Booking> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
