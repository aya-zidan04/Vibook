package com.vibook.web.controller;

import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.BookingService;
import com.vibook.web.dto.booking.BookingListResponse;
import com.vibook.web.dto.booking.BookingResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/bookings")
public class MeBookingsController {

    private final BookingService bookingService;

    public MeBookingsController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public BookingListResponse listBookings(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        return bookingService.listBookings(principal.getId());
    }

    @GetMapping("/{id}")
    public BookingResponse getBooking(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable UUID id
    ) {
        return bookingService.getBooking(principal.getId(), id);
    }
}
