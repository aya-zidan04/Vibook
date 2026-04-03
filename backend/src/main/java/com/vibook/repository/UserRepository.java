package com.vibook.repository;

import com.vibook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("""
            SELECT DISTINCT u FROM User u
            LEFT JOIN FETCH u.roles
            LEFT JOIN FETCH u.city
            WHERE LOWER(u.email) = LOWER(:email)
            """)
    Optional<User> findByEmailIgnoreCaseWithRoles(@Param("email") String email);

    @Query("""
            SELECT u FROM User u
            LEFT JOIN FETCH u.city
            WHERE u.id = :id
            """)
    Optional<User> findByIdWithCity(@Param("id") UUID id);

    @Query("""
            SELECT DISTINCT u FROM User u
            LEFT JOIN FETCH u.membershipPlan
            WHERE u.id = :id
            """)
    Optional<User> findByIdWithMembershipPlan(@Param("id") UUID id);
}
