package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminModerationReportResponse;
import com.vibook.backend.dto.AdminReportResolveRequest;
import com.vibook.backend.entity.ModerationReport;
import com.vibook.backend.entity.ModerationReportStatus;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.repository.ModerationReportRepository;
import com.vibook.backend.service.AdminModerationReportService;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminModerationReportServiceImpl implements AdminModerationReportService {

    private final ModerationReportRepository moderationReportRepository;

    public AdminModerationReportServiceImpl(ModerationReportRepository moderationReportRepository) {
        this.moderationReportRepository = moderationReportRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminModerationReportResponse> list(Pageable pageable) {
        return moderationReportRepository.findAllPaged(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminModerationReportResponse getById(Long id) {
        return toResponse(
            moderationReportRepository
                .findDetailById(id)
                .orElseThrow(() -> new NotFoundException("Report not found"))
        );
    }

    @Override
    @Transactional
    public AdminModerationReportResponse review(Long id, AdminReportResolveRequest request) {
        ModerationReport report = moderationReportRepository
            .findDetailById(id)
            .orElseThrow(() -> new NotFoundException("Report not found"));
        if (report.getStatus() != ModerationReportStatus.OPEN) {
            throw new BadRequestException("Only open reports can be marked reviewed");
        }
        report.setStatus(ModerationReportStatus.REVIEWED);
        applyAdminNotes(report, request);
        return toResponse(moderationReportRepository.save(report));
    }

    @Override
    @Transactional
    public AdminModerationReportResponse resolve(Long id, AdminReportResolveRequest request) {
        ModerationReport report = moderationReportRepository
            .findDetailById(id)
            .orElseThrow(() -> new NotFoundException("Report not found"));
        if (isClosed(report.getStatus())) {
            throw new BadRequestException("Report is already closed");
        }
        report.setStatus(ModerationReportStatus.RESOLVED);
        report.setResolvedAt(Instant.now());
        applyAdminNotes(report, request);
        return toResponse(moderationReportRepository.save(report));
    }

    @Override
    @Transactional
    public AdminModerationReportResponse dismiss(Long id, AdminReportResolveRequest request) {
        ModerationReport report = moderationReportRepository
            .findDetailById(id)
            .orElseThrow(() -> new NotFoundException("Report not found"));
        if (isClosed(report.getStatus())) {
            throw new BadRequestException("Report is already closed");
        }
        report.setStatus(ModerationReportStatus.DISMISSED);
        report.setResolvedAt(Instant.now());
        applyAdminNotes(report, request);
        return toResponse(moderationReportRepository.save(report));
    }

    private static boolean isClosed(ModerationReportStatus status) {
        return status == ModerationReportStatus.RESOLVED || status == ModerationReportStatus.DISMISSED;
    }

    private static void applyAdminNotes(ModerationReport report, AdminReportResolveRequest request) {
        if (request == null || request.adminNotes() == null) {
            return;
        }
        String n = request.adminNotes().trim();
        report.setAdminNotes(n.isEmpty() ? null : n);
    }

    private AdminModerationReportResponse toResponse(ModerationReport r) {
        Instant updatedAt = r.getUpdatedAt() != null ? r.getUpdatedAt() : r.getCreatedAt();
        return new AdminModerationReportResponse(
            r.getId(),
            r.getReporter().getId(),
            r.getReporter().getEmail(),
            r.getType(),
            r.getTargetId(),
            r.getReason(),
            r.getDescription(),
            r.getStatus(),
            r.getAdminNotes(),
            r.getCreatedAt(),
            updatedAt,
            r.getResolvedAt()
        );
    }
}
