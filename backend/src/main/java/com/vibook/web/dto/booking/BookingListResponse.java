package com.vibook.web.dto.booking;

import java.util.List;

public record BookingListResponse(List<BookingResponse> bookings) {
}
