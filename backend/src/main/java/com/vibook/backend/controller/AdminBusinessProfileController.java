package com.vibook.backend.controller;

import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.RejectBusinessProfileRequest;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminBusinessProfileService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/business-profiles")
public class AdminBusinessProfileController {

    private final AdminBusinessProfileService adminBusinessProfileService;

    public AdminBusinessProfileController(AdminBusinessProfileService adminBusinessProfileService) {
        this.adminBusinessProfileService = adminBusinessProfileService;
    }

    @GetMapping
    public ResponseEntity<Page<BusinessProfileResponse>> list(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam(required = false) BusinessProfileStatus status,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminBusinessProfileService.listProfiles(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessProfileResponse> getById(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminBusinessProfileService.getProfile(id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BusinessProfileResponse> approve(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminBusinessProfileService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BusinessProfileResponse> reject(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @RequestBody(required = false) RejectBusinessProfileRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminBusinessProfileService.reject(id, request));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
