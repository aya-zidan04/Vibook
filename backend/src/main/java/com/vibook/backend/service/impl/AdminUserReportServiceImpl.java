package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminUserReportResponse;
import com.vibook.backend.dto.AdminUserReportStatusRequest;
import com.vibook.backend.entity.UserReport;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.repository.UserReportRepository;
import com.vibook.backend.service.AdminUserReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserReportServiceImpl implements AdminUserReportService {

    private final UserReportRepository userReportRepository;

    public AdminUserReportServiceImpl(UserReportRepository userReportRepository) {
        this.userReportRepository = userReportRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserReportResponse> list(Pageable pageable) {
        return userReportRepository.findAllPaged(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserReportResponse getById(Long id) {
        return toResponse(
            userReportRepository
                .findDetailById(id)
                .orElseThrow(() -> new NotFoundException("Report not found"))
        );
    }

    @Override
    @Transactional
    public AdminUserReportResponse updateStatus(Long id, AdminUserReportStatusRequest request) {
        UserReport report = userReportRepository
            .findDetailById(id)
            .orElseThrow(() -> new NotFoundException("Report not found"));
        report.setStatus(request.status());
        return toResponse(userReportRepository.save(report));
    }

    private AdminUserReportResponse toResponse(UserReport r) {
        var updatedAt = r.getUpdatedAt() != null ? r.getUpdatedAt() : r.getCreatedAt();
        return new AdminUserReportResponse(
            r.getId(),
            r.getUser().getId(),
            r.getUser().getEmail(),
            r.getSubject(),
            r.getMessage(),
            r.getStatus(),
            r.getCreatedAt(),
            updatedAt
        );
    }
}
