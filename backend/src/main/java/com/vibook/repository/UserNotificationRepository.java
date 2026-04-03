package com.vibook.repository;

import com.vibook.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserNotificationRepository extends JpaRepository<UserNotification, UUID> {

    List<UserNotification> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<UserNotification> findByIdAndUser_Id(UUID id, UUID userId);

    @Modifying
    @Query("update UserNotification n set n.read = true where n.user.id = :userId and n.read = false")
    int markAllReadForUser(@Param("userId") UUID userId);
}
