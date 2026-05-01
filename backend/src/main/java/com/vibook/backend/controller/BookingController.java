package com.vibook.backend.controller;

import com.vibook.backend.dto.BookingCreateRequest;
import com.vibook.backend.dto.BookingResponse;
import com.vibook.backend.dto.CancelBookingRequest;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody BookingCreateRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> myBookings(@AuthenticationPrincipal AuthenticatedUser principal) {
        requirePrincipal(principal);
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<BookingResponse> myBookingById(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(bookingService.getMyBookingById(id));
    }

    @PatchMapping("/me/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelMyBooking(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @RequestBody(required = false) CancelBookingRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(bookingService.cancelMyBooking(id, request));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
