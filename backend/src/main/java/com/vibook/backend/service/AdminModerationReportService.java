package com.vibook.backend.service;

import com.vibook.backend.dto.AdminModerationReportResponse;
import com.vibook.backend.dto.AdminReportResolveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminModerationReportService {

    Page<AdminModerationReportResponse> list(Pageable pageable);

    AdminModerationReportResponse getById(Long id);

    AdminModerationReportResponse review(Long id, AdminReportResolveRequest request);

    AdminModerationReportResponse resolve(Long id, AdminReportResolveRequest request);

    AdminModerationReportResponse dismiss(Long id, AdminReportResolveRequest request);
}
