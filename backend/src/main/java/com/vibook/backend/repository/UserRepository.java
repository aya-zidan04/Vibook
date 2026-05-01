package com.vibook.backend.repository;

import com.vibook.backend.entity.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    long countByEnabledTrue();

    List<User> findByCreatedAtGreaterThanEqual(Instant from);
}
