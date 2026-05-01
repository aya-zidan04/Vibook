package com.vibook.backend.service;

import com.vibook.backend.dto.AdminActivityLogResponse;
import com.vibook.backend.entity.AdminActivityAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminActivityLogService {

    void log(
        Long adminUserId,
        String adminEmail,
        AdminActivityAction action,
        String entityType,
        Long entityId,
        String details
    );

    Page<AdminActivityLogResponse> list(Pageable pageable);

    Page<AdminActivityLogResponse> listForEntity(String entityType, Long entityId, Pageable pageable);
}
