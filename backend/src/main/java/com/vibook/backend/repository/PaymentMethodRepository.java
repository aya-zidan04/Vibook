package com.vibook.backend.repository;

import com.vibook.backend.entity.PaymentMethod;
import com.vibook.backend.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    List<PaymentMethod> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);

    boolean existsByUser(User user);
}
