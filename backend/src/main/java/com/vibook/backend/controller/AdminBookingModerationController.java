package com.vibook.backend.controller;

import com.vibook.backend.dto.AdminBookingCancelRequest;
import com.vibook.backend.dto.AdminBookingResponse;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminBookingModerationService;
import jakarta.validation.Valid;
import java.time.LocalDate;
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
@RequestMapping("/api/v1/admin/bookings")
public class AdminBookingModerationController {

    private final AdminBookingModerationService adminBookingModerationService;

    public AdminBookingModerationController(AdminBookingModerationService adminBookingModerationService) {
        this.adminBookingModerationService = adminBookingModerationService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminBookingResponse>> list(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam(required = false) BookingStatus status,
        @RequestParam(required = false) Long businessProfileId,
        @RequestParam(required = false) LocalDate dateFrom,
        @RequestParam(required = false) LocalDate dateTo,
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(
            adminBookingModerationService.list(status, businessProfileId, dateFrom, dateTo, search, pageable)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminBookingResponse> getById(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminBookingModerationService.getById(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AdminBookingResponse> cancel(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody(required = false) AdminBookingCancelRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminBookingModerationService.cancel(id, request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<AdminBookingResponse> complete(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminBookingModerationService.complete(id));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
