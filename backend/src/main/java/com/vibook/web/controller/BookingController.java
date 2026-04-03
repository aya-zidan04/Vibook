package com.vibook.web.controller;

import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.BookingService;
import com.vibook.web.dto.booking.BookingResponse;
import com.vibook.web.dto.booking.CreateBookingRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponse createBooking(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return bookingService.createBooking(principal.getId(), request);
    }

    @PostMapping("/{id}/cancel")
    public BookingResponse cancelBooking(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable UUID id
    ) {
        return bookingService.cancelBooking(principal.getId(), id);
    }
}
