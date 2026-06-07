package com.vibook.backend.service;

import com.vibook.backend.dto.AdminBookingResponse;
import com.vibook.backend.entity.BookingStatus;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminBookingModerationService {

    Page<AdminBookingResponse> list(
        BookingStatus status,
        Long businessProfileId,
        LocalDate dateFrom,
        LocalDate dateTo,
        String search,
        Pageable pageable
    );

    AdminBookingResponse getById(Long id);
}
