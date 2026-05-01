package com.vibook.backend.controller;

import com.vibook.backend.dto.BookingResponse;
import com.vibook.backend.dto.BookingStatusUpdateRequest;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/business/bookings")
public class BusinessBookingController {

    private final BookingService bookingService;

    public BusinessBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        requirePrincipal(principal);
        return ResponseEntity.ok(bookingService.getBookingsForMyBusiness());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(bookingService.getBusinessBookingById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(bookingService.updateBookingStatusForBusiness(id, request));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
