package com.vibook.backend.controller;

import com.vibook.backend.dto.AdminEventDetailPayload;
import com.vibook.backend.dto.AdminEventNotesRequest;
import com.vibook.backend.dto.AdminEventRowResponse;
import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminEventModerationService;
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
@RequestMapping("/api/v1/admin/events")
public class AdminEventModerationController {

    private final AdminEventModerationService adminEventModerationService;

    public AdminEventModerationController(AdminEventModerationService adminEventModerationService) {
        this.adminEventModerationService = adminEventModerationService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminEventRowResponse>> list(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Long governorateId,
        @RequestParam(required = false) String visibility,
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(
            adminEventModerationService.list(categoryId, governorateId, visibility, search, pageable)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminEventDetailPayload> getById(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminEventModerationService.getById(id));
    }

    @PatchMapping("/{id}/hide")
    public ResponseEntity<BusinessEventResponse> hide(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminEventModerationService.hide(id));
    }

    @PatchMapping("/{id}/show")
    public ResponseEntity<BusinessEventResponse> show(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminEventModerationService.show(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id) {
        requirePrincipal(principal);
        adminEventModerationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<Void> updateNotes(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody AdminEventNotesRequest request
    ) {
        requirePrincipal(principal);
        adminEventModerationService.updateNotes(id, request);
        return ResponseEntity.noContent().build();
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
