package com.vibook.backend.repository;

import com.vibook.backend.entity.Payment;
import com.vibook.backend.entity.PaymentStatus;
import java.util.Collection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaypalOrderId(String paypalOrderId);

    Optional<Payment> findTopByBooking_IdOrderByCreatedAtDesc(Long bookingId);

    boolean existsByBooking_IdAndStatusIn(Long bookingId, Collection<PaymentStatus> statuses);
}
