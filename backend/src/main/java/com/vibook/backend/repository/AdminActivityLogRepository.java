package com.vibook.backend.repository;

import com.vibook.backend.entity.AdminActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {

    Page<AdminActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
        String entityType,
        Long entityId,
        Pageable pageable
    );
}
