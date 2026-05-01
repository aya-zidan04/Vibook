package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminBookingCancelRequest;
import com.vibook.backend.dto.AdminBookingResponse;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.BookingMapper;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.service.AdminBookingModerationService;
import com.vibook.backend.spec.AdminBookingSpecs;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBookingModerationServiceImpl implements AdminBookingModerationService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    public AdminBookingModerationServiceImpl(BookingRepository bookingRepository, BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminBookingResponse> list(
        BookingStatus status,
        Long businessProfileId,
        LocalDate dateFrom,
        LocalDate dateTo,
        String search,
        Pageable pageable
    ) {
        var spec = AdminBookingSpecs.withFilters(status, businessProfileId, dateFrom, dateTo, search);
        return bookingRepository.findAll(spec, pageable).map(bookingMapper::toAdminResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminBookingResponse getById(Long id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
        return bookingMapper.toAdminResponse(booking);
    }

    @Override
    @Transactional
    public AdminBookingResponse cancel(Long id, AdminBookingCancelRequest request) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        if (request != null && StringUtils.hasText(request.reason())) {
            booking.setCancelReason(request.reason().trim());
        }
        return bookingMapper.toAdminResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public AdminBookingResponse complete(Long id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot complete a cancelled booking");
        }
        booking.setStatus(BookingStatus.COMPLETED);
        return bookingMapper.toAdminResponse(bookingRepository.save(booking));
    }
}
