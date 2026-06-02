package com.vibook.backend.service;

import com.vibook.backend.dto.AdminUserReportResponse;
import com.vibook.backend.dto.AdminUserReportStatusRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserReportService {

    Page<AdminUserReportResponse> list(Pageable pageable);

    AdminUserReportResponse getById(Long id);

    AdminUserReportResponse updateStatus(Long id, AdminUserReportStatusRequest request);
}
