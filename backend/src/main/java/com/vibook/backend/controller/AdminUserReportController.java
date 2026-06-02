package com.vibook.backend.controller;

import com.vibook.backend.dto.AdminUserReportResponse;
import com.vibook.backend.dto.AdminUserReportStatusRequest;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminUserReportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/user-reports")
public class AdminUserReportController {

    private final AdminUserReportService adminUserReportService;

    public AdminUserReportController(AdminUserReportService adminUserReportService) {
        this.adminUserReportService = adminUserReportService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminUserReportResponse>> list(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminUserReportService.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserReportResponse> getById(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminUserReportService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminUserReportResponse> updateStatus(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody AdminUserReportStatusRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminUserReportService.updateStatus(id, request));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
