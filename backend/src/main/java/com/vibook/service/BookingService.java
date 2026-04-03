package com.vibook.service;

import com.vibook.entity.Booking;
import com.vibook.entity.enums.BookingStatus;
import com.vibook.entity.enums.BookingType;
import com.vibook.repository.BookingRepository;
import com.vibook.repository.UserRepository;
import com.vibook.web.dto.booking.BookingListResponse;
import com.vibook.web.dto.booking.BookingResponse;
import com.vibook.web.dto.booking.CreateBookingRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CatalogEntityExistsService catalogEntityExistsService;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            CatalogEntityExistsService catalogEntityExistsService
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.catalogEntityExistsService = catalogEntityExistsService;
    }

    @Transactional(readOnly = true)
    public BookingListResponse listBookings(UUID userId) {
        var list = bookingRepository.findAllForUserOrderByStartsAtDesc(userId).stream()
                .map(BookingResponse::fromEntity)
                .toList();
        return new BookingListResponse(list);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(UUID userId, UUID bookingId) {
        Booking b = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return BookingResponse.fromEntity(b);
    }

    @Transactional
    public BookingResponse createBooking(UUID userId, CreateBookingRequest request) {
        BookingType type = BookingType.fromApiValue(request.type());
        catalogEntityExistsService.assertBookingRefExists(type, request.refId());

        int quantity = request.quantity() == null ? 1 : request.quantity();
        BigDecimal fees = request.fees() == null ? BigDecimal.ZERO : request.fees();
        BigDecimal total;
        if (request.totalPaid() != null) {
            total = request.totalPaid();
        } else if (request.unitPrice() != null) {
            total = request.unitPrice().multiply(BigDecimal.valueOf(quantity)).add(fees);
        } else {
            throw new IllegalArgumentException("Provide totalPaid or unitPrice");
        }
        total = total.setScale(4, RoundingMode.HALF_UP);

        BookingStatus status = resolveInitialStatus(request.startsAt(), total);

        Booking b = new Booking();
        b.setUser(userRepository.getReferenceById(userId));
        b.setBookingType(type);
        b.setRefId(request.refId());
        b.setRefTitle(request.refTitle().trim());
        if (request.refTitleAr() != null && !request.refTitleAr().isBlank()) {
            b.setRefTitleAr(request.refTitleAr().trim());
        }
        b.setImageUrl(request.imageUrl().trim());
        b.setStartsAt(request.startsAt());
        b.setCityName(request.cityName().trim());
        if (request.cityNameAr() != null && !request.cityNameAr().isBlank()) {
            b.setCityNameAr(request.cityNameAr().trim());
        }
        b.setTotalPaid(total);
        b.setCurrency(request.currency());
        b.setQuantity(quantity);
        b.setUnitPrice(request.unitPrice());
        b.setFees(fees);
        if (request.paymentReference() != null && !request.paymentReference().isBlank()) {
            b.setPaymentReference(request.paymentReference().trim());
        }
        b.setStatus(status);

        return BookingResponse.fromEntity(bookingRepository.save(b));
    }

    private static BookingStatus resolveInitialStatus(Instant startsAt, BigDecimal totalPaid) {
        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            return BookingStatus.PENDING_PAYMENT;
        }
        if (startsAt.isBefore(Instant.now())) {
            return BookingStatus.PAST;
        }
        return BookingStatus.UPCOMING;
    }

    @Transactional
    public BookingResponse cancelBooking(UUID userId, UUID bookingId) {
        Booking b = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (b.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }
        if (b.getStatus() == BookingStatus.PAST) {
            throw new IllegalArgumentException("Past bookings cannot be cancelled");
        }
        b.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.fromEntity(bookingRepository.save(b));
    }
}
