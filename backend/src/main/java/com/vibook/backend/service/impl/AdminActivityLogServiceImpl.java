package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminActivityLogResponse;
import com.vibook.backend.entity.AdminActivityAction;
import com.vibook.backend.entity.AdminActivityLog;
import com.vibook.backend.repository.AdminActivityLogRepository;
import com.vibook.backend.service.AdminActivityLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminActivityLogServiceImpl implements AdminActivityLogService {

    private final AdminActivityLogRepository adminActivityLogRepository;

    public AdminActivityLogServiceImpl(AdminActivityLogRepository adminActivityLogRepository) {
        this.adminActivityLogRepository = adminActivityLogRepository;
    }

    @Override
    @Transactional
    public void log(
        Long adminUserId,
        String adminEmail,
        AdminActivityAction action,
        String entityType,
        Long entityId,
        String details
    ) {
        AdminActivityLog row = new AdminActivityLog();
        row.setAdminUserId(adminUserId);
        row.setAdminEmail(adminEmail);
        row.setAction(action);
        row.setEntityType(entityType);
        row.setEntityId(entityId);
        row.setDetails(details);
        adminActivityLogRepository.save(row);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminActivityLogResponse> list(Pageable pageable) {
        return adminActivityLogRepository
            .findAll(pageable)
            .map(AdminActivityLogServiceImpl::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminActivityLogResponse> listForEntity(String entityType, Long entityId, Pageable pageable) {
        return adminActivityLogRepository
            .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable)
            .map(AdminActivityLogServiceImpl::toResponse);
    }

    private static AdminActivityLogResponse toResponse(AdminActivityLog e) {
        return new AdminActivityLogResponse(
            e.getId(),
            e.getAdminUserId(),
            e.getAdminEmail(),
            e.getAction(),
            e.getEntityType(),
            e.getEntityId(),
            e.getDetails(),
            e.getCreatedAt()
        );
    }
}
