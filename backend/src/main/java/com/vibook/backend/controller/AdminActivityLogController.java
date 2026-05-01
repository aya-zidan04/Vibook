package com.vibook.backend.controller;

import com.vibook.backend.dto.AdminActivityLogResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminActivityLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/activity-log")
public class AdminActivityLogController {

    private final AdminActivityLogService adminActivityLogService;

    public AdminActivityLogController(AdminActivityLogService adminActivityLogService) {
        this.adminActivityLogService = adminActivityLogService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminActivityLogResponse>> list(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam(required = false) String entityType,
        @RequestParam(required = false) Long entityId,
        @PageableDefault(size = 30, sort = "createdAt,desc") Pageable pageable
    ) {
        requirePrincipal(principal);
        if (entityType != null && entityId != null) {
            return ResponseEntity.ok(adminActivityLogService.listForEntity(entityType, entityId, pageable));
        }
        return ResponseEntity.ok(adminActivityLogService.list(pageable));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
