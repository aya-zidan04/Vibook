package com.vibook.backend.repository;

import com.vibook.backend.entity.RefreshToken;
import com.vibook.backend.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);

    List<RefreshToken> findAllByUser(User user);
}
