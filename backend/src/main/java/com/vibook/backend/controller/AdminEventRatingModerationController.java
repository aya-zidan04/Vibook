package com.vibook.backend.controller;

import com.vibook.backend.dto.AdminEventRatingResponse;
import com.vibook.backend.dto.AdminRatingModerationRequest;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminEventRatingModerationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/ratings")
public class AdminEventRatingModerationController {

    private final AdminEventRatingModerationService adminEventRatingModerationService;

    public AdminEventRatingModerationController(AdminEventRatingModerationService adminEventRatingModerationService) {
        this.adminEventRatingModerationService = adminEventRatingModerationService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminEventRatingResponse>> list(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam(required = false) Integer minRating,
        @RequestParam(required = false) Boolean flaggedOnly,
        @RequestParam(required = false) String search,
        @PageableDefault(size = 25, sort = "createdAt") Pageable pageable
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminEventRatingModerationService.list(minRating, flaggedOnly, search, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id) {
        requirePrincipal(principal);
        adminEventRatingModerationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/hide")
    public ResponseEntity<AdminEventRatingResponse> setHidden(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody AdminRatingModerationRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminEventRatingModerationService.setHidden(id, request.hidden()));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
