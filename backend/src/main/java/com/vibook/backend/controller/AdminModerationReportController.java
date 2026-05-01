package com.vibook.backend.controller;

import com.vibook.backend.dto.AdminModerationReportResponse;
import com.vibook.backend.dto.AdminReportResolveRequest;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminModerationReportService;
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
@RequestMapping("/api/v1/admin/reports")
public class AdminModerationReportController {

    private final AdminModerationReportService adminModerationReportService;

    public AdminModerationReportController(AdminModerationReportService adminModerationReportService) {
        this.adminModerationReportService = adminModerationReportService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminModerationReportResponse>> list(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminModerationReportService.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminModerationReportResponse> getById(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminModerationReportService.getById(id));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<AdminModerationReportResponse> review(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody(required = false) AdminReportResolveRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminModerationReportService.review(id, request));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<AdminModerationReportResponse> resolve(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody(required = false) AdminReportResolveRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminModerationReportService.resolve(id, request));
    }

    @PatchMapping("/{id}/dismiss")
    public ResponseEntity<AdminModerationReportResponse> dismiss(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody(required = false) AdminReportResolveRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminModerationReportService.dismiss(id, request));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
