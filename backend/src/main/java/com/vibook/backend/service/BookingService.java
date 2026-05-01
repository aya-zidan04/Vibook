package com.vibook.backend.service;

import com.vibook.backend.dto.BookingCreateRequest;
import com.vibook.backend.dto.BookingResponse;
import com.vibook.backend.dto.BookingStatusUpdateRequest;
import com.vibook.backend.dto.CancelBookingRequest;
import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingCreateRequest request);

    List<BookingResponse> getMyBookings();

    BookingResponse getMyBookingById(Long id);

    BookingResponse cancelMyBooking(Long id, CancelBookingRequest request);

    List<BookingResponse> getBookingsForMyBusiness();

    BookingResponse getBusinessBookingById(Long id);

    BookingResponse updateBookingStatusForBusiness(Long id, BookingStatusUpdateRequest request);
}
