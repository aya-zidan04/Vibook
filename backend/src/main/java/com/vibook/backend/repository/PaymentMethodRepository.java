package com.vibook.backend.repository;

import com.vibook.backend.entity.PaymentMethod;
import com.vibook.backend.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    List<PaymentMethod> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);

    List<PaymentMethod> findByUserOrderByCreatedAtDesc(User user);

    Optional<PaymentMethod> findByIdAndUser_Id(Long id, Long userId);

    boolean existsByUser(User user);
}
