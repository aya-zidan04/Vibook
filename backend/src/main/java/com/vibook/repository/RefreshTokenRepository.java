package com.vibook.repository;

import com.vibook.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Query("""
            SELECT r FROM RefreshToken r
            JOIN FETCH r.user u
            LEFT JOIN FETCH u.roles
            WHERE r.tokenHash = :hash AND r.revoked = false
            """)
    Optional<RefreshToken> findActiveWithUser(@Param("hash") String hash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user.id = :userId AND r.revoked = false")
    int revokeAllActiveForUser(@Param("userId") UUID userId);
}
